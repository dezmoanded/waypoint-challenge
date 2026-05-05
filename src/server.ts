/*
  MCP stdio server entry
  - Keep stdout strictly for JSON-RPC by routing logs to stderr before any imports
*/
/* eslint-disable no-console */
// Route any library/app logs away from stdout to prevent MCP JSON parse issues
console.log = (...args: any[]) => console.error(...args);
console.warn = (...args: any[]) => console.error(...args);
console.info = (...args: any[]) => console.error(...args);

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createMcpServer } from "./mcp/app.js";

const truthy = new Set(["1", "true", "yes", "on"]); // simple env parser
const shouldLog =
  truthy.has(String(process.env.DEBUG).toLowerCase()) ||
  truthy.has(String(process.env.VERBOSE).toLowerCase()) ||
  truthy.has(String(process.env.WAYPOINT_DEBUG).toLowerCase());

const logConfiguredPaths = () => {
  if (!shouldLog) return; // be quiet by default in stdio mode

  const lessonPath = process.env.LESSON_PDF_PATH ?? "lesson.pdf";
  const iepPath = process.env.IEP_PDF_PATH ?? "iep.pdf";

  console.error("Waypoint MCP server connected over stdio");
  console.error(`Using lesson PDF: ${lessonPath}`);
  console.error(`Using IEP PDF: ${iepPath}`);
};

const main = async () => {
  const server = createMcpServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
  logConfiguredPaths();
};

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

// NOTE: stdout redirection above is intentional to keep JSON-RPC stream clean. [2026-05-05]
