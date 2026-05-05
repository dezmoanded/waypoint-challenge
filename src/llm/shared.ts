/*
  Shared LLM utilities for Anthropic Claude (JSON-only)

  NOTE: Depends on @anthropic-ai/sdk
  - Install: npm install @anthropic-ai/sdk
  - Env var: export ANTHROPIC_API_KEY=your_key_here
*/

import Anthropic from "@anthropic-ai/sdk";

export type LlmOptions = {
  model?: string; // default: claude-sonnet-4-20250514
  maxOutputTokens?: number; // default: 8192
  temperature?: number; // default: 0
  anthropicApiKey?: string; // default: process.env.ANTHROPIC_API_KEY
};

export const LLM_DEFAULTS: Required<Omit<LlmOptions, "anthropicApiKey">> = {
  model: "claude-sonnet-4-20250514",
  maxOutputTokens: 8192,
  temperature: 0,
};

export const STRICT_JSON_SYSTEM =
  "You are a precise extractor/summarizer. Respond with strict JSON only. No preamble, no code fences, no commentary, no markdown.";

export function coerceJson<T = unknown>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch (originalError) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const sliced = text.slice(start, end + 1);
      try {
        return JSON.parse(sliced) as T;
      } catch {
        // fall through to wrapped error below
      }
    }

    const message = originalError instanceof Error ? originalError.message : "unknown JSON parse error";
    throw new Error(`Claude returned malformed JSON: ${message}`);
  }
}

// Lightweight seam for tests to override the Claude call without a network request
export type ClaudeMessageParams = {
  model: string;
  temperature: number;
  max_tokens: number;
  system: string;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: Array<{ type: "text"; text: string }>;
  }>;
};

export type ClaudeLikeResponse = {
  content: Array<{ type: "text"; text: string } | Record<string, unknown>>;
};

let _testClaudeCaller:
  | ((params: ClaudeMessageParams) => Promise<ClaudeLikeResponse>)
  | null = null;

export function setClaudeCallerForTests(
  caller: ((params: ClaudeMessageParams) => Promise<ClaudeLikeResponse>) | null
) {
  _testClaudeCaller = caller;
}

export async function callClaudeJson<T = unknown>(
  userText: string,
  options: LlmOptions = {}
): Promise<T> {
  const model = options.model ?? LLM_DEFAULTS.model;
  const max_tokens = options.maxOutputTokens ?? LLM_DEFAULTS.maxOutputTokens;
  const temperature = options.temperature ?? LLM_DEFAULTS.temperature;

  // If a test override is present, use it and bypass API key/env requirements
  if (_testClaudeCaller) {
    const mocked = await _testClaudeCaller({
      model,
      temperature,
      max_tokens,
      system: STRICT_JSON_SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text" as const,
              text: userText,
            },
          ],
        },
      ],
    });

    const textPart = (mocked as any).content?.find((p: any) => p.type === "text");

    if (!textPart) {
      throw new Error("Mock Claude response did not include a text part.");
    }
    return coerceJson<T>((textPart as any).text as string);
  }

  const apiKey = options.anthropicApiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing Anthropic API key. Set ANTHROPIC_API_KEY or pass anthropicApiKey in options."
    );
  }

  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model,
    temperature,
    max_tokens,
    system: STRICT_JSON_SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text" as const,
            text: userText,
          },
        ],
      },
    ],
  });

  const textPart = (response as any).content?.find((p: any) => p.type === "text");

  if (!textPart) {
    throw new Error("No text content returned from Claude.");
  }

  return coerceJson<T>((textPart as any).text as string);
}
