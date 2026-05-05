import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { IEP_SUMMARY_RESOURCE } from "./context/iepSummary.js";
import { LESSON_MODEL_RESOURCE } from "./context/lessonModel.js";
import { LESSON_RAW_RESOURCE } from "./context/lessonRaw.js";
import { DIFFERENTIATE_LESSON_FOR_STUDENT_PROMPT } from "./prompts/differentiateLessonForStudent.js";
import { GET_DIFFERENTIATE_LESSON_PROMPT_TOOL } from "./tools/getDifferentiateLessonPrompt.js";
import { GET_IEP_SECTION_TOOL } from "./tools/getIepSection.js";
import { GET_IEP_SUMMARY_TOOL } from "./tools/getIepSummary.js";
import { GET_LESSON_MODEL_TOOL } from "./tools/getLessonModel.js";
import { GET_LESSON_RAW_TOOL } from "./tools/getLessonRaw.js";

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "waypoint-challenge",
    version: "0.1.0",
  });

  server.registerResource(
    LESSON_RAW_RESOURCE.name,
    LESSON_RAW_RESOURCE.uri,
    LESSON_RAW_RESOURCE.metadata,
    LESSON_RAW_RESOURCE.read,
  );

  server.registerResource(
    LESSON_MODEL_RESOURCE.name,
    LESSON_MODEL_RESOURCE.uri,
    LESSON_MODEL_RESOURCE.metadata,
    LESSON_MODEL_RESOURCE.read,
  );

  server.registerResource(
    IEP_SUMMARY_RESOURCE.name,
    IEP_SUMMARY_RESOURCE.uri,
    IEP_SUMMARY_RESOURCE.metadata,
    IEP_SUMMARY_RESOURCE.read,
  );

  server.registerTool(
    GET_IEP_SECTION_TOOL.name,
    GET_IEP_SECTION_TOOL.config,
    GET_IEP_SECTION_TOOL.handler,
  );

  server.registerTool(
    GET_LESSON_RAW_TOOL.name,
    GET_LESSON_RAW_TOOL.config,
    GET_LESSON_RAW_TOOL.handler,
  );

  server.registerTool(
    GET_LESSON_MODEL_TOOL.name,
    GET_LESSON_MODEL_TOOL.config,
    GET_LESSON_MODEL_TOOL.handler,
  );

  server.registerTool(
    GET_IEP_SUMMARY_TOOL.name,
    GET_IEP_SUMMARY_TOOL.config,
    GET_IEP_SUMMARY_TOOL.handler,
  );

  server.registerTool(
    GET_DIFFERENTIATE_LESSON_PROMPT_TOOL.name,
    GET_DIFFERENTIATE_LESSON_PROMPT_TOOL.config,
    GET_DIFFERENTIATE_LESSON_PROMPT_TOOL.handler,
  );

  server.registerPrompt(
    DIFFERENTIATE_LESSON_FOR_STUDENT_PROMPT.name,
    DIFFERENTIATE_LESSON_FOR_STUDENT_PROMPT.config,
    DIFFERENTIATE_LESSON_FOR_STUDENT_PROMPT.handler,
  );

  return server;
}
