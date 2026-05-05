# Waypoint Challenge

This repo contains a TypeScript MCP server that helps an LLM generate teacher-ready instructional modifications grounded in a lesson and a student's IEP.

Transport support
- stdio only (for local MCP clients such as Claude Desktop and Codex)
- HTTP endpoint exists in code but is not supported/documented for ChatGPT (ChatGPT does not support MCP)

## Current Status
- MCP server over stdio in `src/server.ts`
- Shared MCP surface factored in `src/mcp/app.ts` (resources, tools, prompts)
- PDF extraction utilities under `src/pdf`

## MCP Server Surface
- Resources: `lesson://raw`, `lesson://model`, `iep://summary`
- Tools: `get_iep_section`, `get_lesson_raw`, `get_lesson_model`, `get_iep_summary`, `get_differentiate_lesson_prompt`
- Prompt: `differentiate_lesson_for_student(lessonUri, iepUri, focus?)`

## Project Structure
- `src/server.ts` — stdio MCP server entrypoint (Claude Desktop and Codex)
- `src/mcp/app.ts` — shared MCP server registration (resources, tools, prompts)
- `src/pdf/extractIepSections.ts` — PDF text extraction and IEP section splitting
- `src/pdf/extractLessonText.ts` — lesson PDF raw-text extraction
- `src/pdf/shared.ts` — shared PDF parsing helpers
- `src/llm/extractLessonModel.ts` — Claude-powered lesson model extractor (requires Anthropic API key)
- `iep.pdf`, `lesson.pdf` — sample PDFs in repo root

## Installation

```bash
npm install
```

## Configuration
Environment variables commonly used by this project:
- `LESSON_PDF_PATH` — path to the lesson PDF (default: `lesson.pdf` in repo root)
- `IEP_PDF_PATH` — path to the IEP PDF (default: `iep.pdf` in repo root)
- `ANTHROPIC_API_KEY` — required for Claude-powered features (e.g., `src/llm/extractLessonModel.ts`)

Examples (macOS/Linux):
```bash
export ANTHROPIC_API_KEY="sk-ant-…"
export LESSON_PDF_PATH="$PWD/lesson.pdf"
export IEP_PDF_PATH="$PWD/iep.pdf"
```

Windows PowerShell:
```powershell
$env:ANTHROPIC_API_KEY = "sk-ant-…"
$env:LESSON_PDF_PATH = "$PWD\lesson.pdf"
$env:IEP_PDF_PATH = "$PWD\iep.pdf"
```

## Commands
- Run stdio MCP server: `npm run dev`
- Type-check only: `npx tsc --noEmit`
- Full check: `npm run check`

---

## Connect via stdio
Use the stdio transport for both Claude Desktop and Codex.

### Claude Desktop (stdio)
1) Start the server (development)
```bash
npm run dev
```

2) Configure Claude Desktop
Config file locations:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

Example config:
```json
{
  "mcpServers": {
    "waypoint-challenge": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/repo/src/server.ts"],
      "env": {
        "LESSON_PDF_PATH": "/absolute/path/to/repo/lesson.pdf",
        "IEP_PDF_PATH": "/absolute/path/to/repo/iep.pdf",
        "ANTHROPIC_API_KEY": "sk-ant-..."
      },
      "autoStart": true
    }
  }
}
```

After restart, Claude Desktop should discover:
- resources: `lesson://raw`, `lesson://model`, `iep://summary`
- tools: `get_iep_section`, `get_lesson_raw`, `get_lesson_model`, `get_iep_summary`, `get_differentiate_lesson_prompt`
- prompt: `differentiate_lesson_for_student`

Notes:
- GUI apps typically do not inherit your shell environment; prefer the `env` block above.
- Logging is routed away from stdout to avoid interfering with stdio I/O.

### Codex (stdio)
Codex also uses stdio. To avoid `npx`/PATH issues, point Codex to your local `tsx` binary and set the working directory to the repo root.

Recommended configuration (conceptual fields; adjust to Codex UI):
- command: `/absolute/path/to/repo/node_modules/.bin/tsx`
- args: `["src/server.ts"]`
- workingDirectory: `/absolute/path/to/repo`
- env:
  - `LESSON_PDF_PATH`: `/absolute/path/to/repo/lesson.pdf`
  - `IEP_PDF_PATH`: `/absolute/path/to/repo/iep.pdf`
  - `ANTHROPIC_API_KEY`: `sk-ant-...`

Alternative (direct Node with tsx loader):
- command: `/path/to/node` (prefer Node 20 or 22 LTS)
- args: `["--loader", "tsx/loader", "src/server.ts"]`
- workingDirectory and env as above

---

## MCP Inspector (stdio sanity check)
Use the official inspector to verify the server surface over stdio.

```bash
npx @modelcontextprotocol/inspector connect-stdio "npx tsx src/server.ts"
```
You should see the registered resources and tools listed.

## Troubleshooting (stdio)
- If the client cannot see tools/resources:
  - Verify with the inspector (above). If inspector works, check the client’s command, args, and workingDirectory.
  - Avoid `npx` in Codex; prefer the absolute `node_modules/.bin/tsx` path.
  - Ensure `LESSON_PDF_PATH` and `IEP_PDF_PATH` point to real files (or rely on defaults `lesson.pdf` and `iep.pdf` in repo root).
- ExperimentalWarning lines you may see on Node 23 come via stderr and do not affect the MCP JSON stream. Use Node 22 LTS to silence them if desired.

## Security & Privacy
- Do not commit secrets. Use environment variables or a local `.env` that is not checked in.
- Anonymize student data; avoid reproducing sensitive IEP content except what’s necessary for provenance.
