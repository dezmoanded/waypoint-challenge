# Waypoint Challenge

This repo contains a TypeScript MCP server that helps an LLM generate teacher-ready instructional modifications grounded in a lesson and a student's IEP.

The server supports two transports:
- stdio for local MCP clients like Claude Desktop
- HTTP for remote/web MCP clients like ChatGPT (typically via an HTTPS tunnel such as ngrok)

## Current Status
- MCP server over stdio in `src/server.ts`
- HTTP MCP entrypoint in `src/http.ts` (for ChatGPT/remote clients)
- Shared MCP surface factored in `src/mcp/app.ts` (resources, tools, prompts)
- PDF extraction utilities under `src/pdf`

## MCP Server Surface
- Resources: `lesson://raw`, `lesson://model`, `iep://summary`
- Tool: `get_iep_section(section, goalId?)`
- Prompt: `differentiate_lesson_for_student(lessonUri, iepUri, focus?)`

## Project Structure
- `src/server.ts` — stdio MCP server entrypoint (Claude Desktop)
- `src/http.ts` — HTTP MCP server entrypoint (ChatGPT/remote)
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

Additional env for the HTTP server (optional):
- `PORT` — default `3000`
- `HOST` — default `127.0.0.1`
- `MCP_PATH` — default `/mcp`

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
- Run stdio MCP server (Claude Desktop): `npm run dev`
- Run HTTP MCP server (ChatGPT/remote): `npm run dev:http`
  - Examples:
    - `PORT=3000 npm run dev:http`
    - `HOST=0.0.0.0 MCP_PATH=/mcp npm run dev:http`
- Type-check only: `npx tsc --noEmit`
- Full check: `npm run check`

---

## Claude Desktop via stdio (recommended for Claude)
Use the stdio transport when connecting from Claude Desktop.

1) Start the server (development)
```bash
npm run dev
```

2) Configure Claude Desktop
Add an entry to your Claude Desktop config (update paths/keys):

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
- tool: `get_iep_section`
- prompt: `differentiate_lesson_for_student`

Notes:
- GUI apps typically do not inherit your shell environment; prefer the `env` block above.
- Logging is configured to avoid interfering with stdio I/O.

---

## ChatGPT via HTTP + ngrok (for remote/web MCP clients)
Use the HTTP transport when connecting from ChatGPT or other remote/web-based MCP clients that require an HTTPS endpoint.

1) Start the HTTP MCP server
```bash
npm run dev:http
```
Optional overrides:
```bash
PORT=3000 HOST=127.0.0.1 MCP_PATH=/mcp npm run dev:http
```
Health check (local):
```
http://127.0.0.1:3000/health
```
MCP endpoint (local):
```
http://127.0.0.1:3000/mcp
```

2) Expose your local server with ngrok
In a separate terminal:
```bash
ngrok http 3000
```
Copy the public HTTPS URL, for example:
```
https://abc123.ngrok-free.app
```

3) Connect ChatGPT to your MCP server
In ChatGPT’s MCP/custom server UI:
- Base URL: your ngrok HTTPS URL (e.g., `https://abc123.ngrok-free.app`)
- MCP endpoint path: `/mcp`
- Full endpoint most clients expect: `https://abc123.ngrok-free.app/mcp`

Keep ngrok running while ChatGPT is connected. If the ngrok URL changes (free plan), update it in ChatGPT.

Session management:
- The HTTP transport uses `mcp-session-id` under the hood. Modern clients (like ChatGPT) persist this automatically.

4) Optional: sanity checks
Health:
```bash
curl -s https://abc123.ngrok-free.app/health
```
Initial POST (client normally handles this):
```bash
curl -X POST https://abc123.ngrok-free.app/mcp \
  -H "content-type: application/json" \
  -d "{}"
```
Subsequent requests should include the `mcp-session-id` returned by the server (your MCP client will handle this).

---

## Which transport should I use?
- Claude Desktop: stdio (`npm run dev`)
- ChatGPT/remote clients: HTTP + ngrok (`npm run dev:http`, then tunnel)

Both entrypoints expose the same resources, tools, and prompts; only the transport differs.

## Troubleshooting
- If Claude Desktop does not see the server, double-check the absolute path in the `args` array and verify environment variables are set in the config.
- If ChatGPT cannot connect:
  - Confirm the local health endpoint works (e.g., `http://127.0.0.1:3000/health`).
  - Confirm your ngrok tunnel is running and using HTTPS.
  - Ensure your client is pointing at the full MCP path (e.g., `/mcp`).
  - If you bound `HOST` to `127.0.0.1`, ngrok still works; you generally do not need `0.0.0.0` unless running in certain containerized environments.

## Security & Privacy
- Do not commit secrets. Use environment variables or a local `.env` that is not checked in.
- Anonymize student data; avoid reproducing sensitive IEP content except what’s necessary for provenance.
