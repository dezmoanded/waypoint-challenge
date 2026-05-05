import http from "node:http";
import { randomUUID } from "node:crypto";

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { createMcpServer } from "./mcp/app.js";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "127.0.0.1";
const mcpPath = process.env.MCP_PATH ?? "/mcp";

const transports = new Map<string, StreamableHTTPServerTransport>();

function writeJson(res: http.ServerResponse, statusCode: number, body: unknown) {
  res.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function getSessionId(req: http.IncomingMessage): string | undefined {
  const header = req.headers["mcp-session-id"];
  return Array.isArray(header) ? header[0] : header;
}

async function getRawBody(req: http.IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  const server = http.createServer(async (req, res) => {
    try {
      if (!req.url || !req.method) {
        writeJson(res, 400, { error: "Missing request metadata." });
        return;
      }

      const url = new URL(req.url, `http://${req.headers.host ?? `${host}:${port}`}`);

      if (url.pathname === "/health") {
        writeJson(res, 200, {
          ok: true,
          transport: "streamable-http",
          mcpPath,
        });
        return;
      }

      if (url.pathname !== mcpPath) {
        writeJson(res, 404, { error: "Not found." });
        return;
      }

      if (req.method === "POST") {
        const rawBody = await getRawBody(req);
        const parsedBody = rawBody.length > 0 ? JSON.parse(rawBody) : undefined;
        const sessionId = getSessionId(req);

        let transport = sessionId ? transports.get(sessionId) : undefined;
        if (!transport) {
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (newSessionId) => {
              transports.set(newSessionId, transport!);
            },
            onsessionclosed: (closedSessionId) => {
              transports.delete(closedSessionId);
            },
          });

          const mcpServer = createMcpServer();
          await mcpServer.connect(transport);
        }

        await transport.handleRequest(req, res, parsedBody);
        return;
      }

      if (req.method === "GET" || req.method === "DELETE") {
        const sessionId = getSessionId(req);
        const transport = sessionId ? transports.get(sessionId) : undefined;

        if (!transport) {
          writeJson(res, 400, {
            error: "Missing or invalid mcp-session-id header for this request.",
          });
          return;
        }

        await transport.handleRequest(req, res);
        if (req.method === "DELETE" && sessionId) {
          transports.delete(sessionId);
        }
        return;
      }

      writeJson(res, 405, { error: "Method not allowed." });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      writeJson(res, 500, { error: message });
    }
  });

  server.listen(port, host, () => {
    console.error(`Waypoint MCP HTTP server listening on http://${host}:${port}${mcpPath}`);
    console.error(`Health check available at http://${host}:${port}/health`);
  });
}

main().catch((error) => {
  console.error("HTTP server error:", error);
  process.exit(1);
});
