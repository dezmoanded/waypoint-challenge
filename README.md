# Waypoint Challenge — Differentiating Instruction via MCP (stdio)

## TL;DR

This MCP server enables Claude to transform a specific lesson and a specific student’s IEP into teacher-ready instructional modifications.

It does not generate generic strategies.
It rewrites the actual lesson tasks so the student can complete them.

Core model:
lesson demands → IEP constraints → task-level modifications

The output is a Differentiated Lesson Pack that a teacher can use immediately with minimal prep, while preserving the original grade-level objective.

---

## Key Insight

IEPs are not documents teachers need to read—they are constraint systems describing how a student can and cannot engage with instructional tasks.

The core problem is not:
- summarizing a 20-page IEP
- listing accommodations
- generating general differentiation strategies

It is:

> How do we transform a specific lesson so this student can successfully complete it tomorrow?

Most approaches fail because they operate at the wrong level (document or strategy).

This system operates at the level of instructional tasks:
- reading passages
- answering questions
- writing responses
- participating in discussion
- completing assessments

Every modification answers:

> What does the teacher do differently so this student can complete this task?

---

## What This Server Does (Outcome-First)

Input
- One lesson (PDF → structured model)
- One student IEP (PDF → structured summary + sections)

Output
- A Differentiated Lesson Pack including:
  - modified lesson flow by phase
  - scaffolded questions and organizers
  - teacher scripts and student-facing language
  - assessment adjustments
  - accommodation reminders
  - explicit grounding in lesson + IEP

Each recommendation:
- targets a specific task
- is grounded in both sources
- is immediately usable in the classroom

---

## Why This Approach Works

Instead of:

IEP → summary → strategies

This system uses:

Lesson demands → IEP constraints → task transformation

Key properties:

- Grounded: Every recommendation references both a lesson feature and an IEP source
- Task-level: Modifications change what the student and teacher actually do
- Rigor-preserving: The grade-level standard remains intact; access is scaffolded
- Teacher-usable: Outputs include scripts, materials, and structures that can be used immediately

---

## Quick Start (stdio only)

Prerequisites
- Node.js 20 or 22 LTS
- Claude Desktop or Codex (MCP clients)
- Optional: ANTHROPIC_API_KEY

Install
- npm install

Run (stdio)
- npx tsx src/server.ts

### Claude Desktop config (example)

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

### Codex config (example)

```toml
[mcp_servers.challenge]
command = "npx"
args = ["tsx", "/absolute/path/to/repo/src/server.ts"]

[mcp_servers.challenge.env]
IEP_PDF_PATH = "/absolute/path/to/repo/iep.pdf"
LESSON_PDF_PATH = "/absolute/path/to/repo/lesson.pdf"
```

---

## MCP Architecture Overview

MCP surface is designed to support task-level transformation with strong grounding.

Resources
- lesson://raw — raw lesson text
- lesson://model — structured lesson model
- iep://summary — structured IEP summary

Tools
- get_iep_section — targeted IEP retrieval with provenance
- get_lesson_raw
- get_lesson_model
- get_iep_summary
- get_differentiate_lesson_prompt

Prompt
- differentiate_lesson_for_student
  - Guides Claude to identify lesson demands, map them to IEP constraints, and generate concrete modifications

---

## Data Flow

```
Lesson.pdf + IEP.pdf
        ↓
Structured representations
        ↓
MCP resources + tools
        ↓
Prompt-guided reasoning
        ↓
Differentiated Lesson Pack
```

---

## Chunking and Retrieval

Lesson — chunked by:
- objectives
- phases
- tasks
- assessments

IEP — chunked by:
- present levels
- goals
- accommodations
- services

Retrieval strategy:
- summaries for global reasoning
- get_iep_section for exact grounding

---

## Grounding and Provenance

Every recommendation must include:
- a lesson anchor (phase/task)
- an IEP source (section/tool output)

This prevents:
- generic outputs
- hallucinated accommodations

---

## Trade-offs

- Depth over breadth (one lesson, done well)
- Minimal architecture (no overengineering)
- Teacher usability over technical novelty

---

## Example Output

See: Differentiated Lesson Pack generated from sample lesson + IEP.

- Jasmine example: [examples/differentiated_lesson_pack_jasmine.md](examples/differentiated_lesson_pack_jasmine.md)

Key properties:
- task-level modifications
- explicit scaffolds
- teacher scripts
- grounded references

---

## Evaluation Criteria Alignment

Output quality
- Concrete, teacher-ready modifications
- Grounded in lesson + IEP
- Usable without editing

Architecture decisions
- Clear MCP surface
- Separation of resources/tools/prompts
- Targeted retrieval via tools

Code quality
- TypeScript + schema validation
- Clean separation of concerns
- stdio-safe logging

Domain understanding
- UDL-aligned supports
- Task-level differentiation
- Focus on real classroom constraints

---

## Why Not a Simpler Approach?

A naive system would:
- summarize the IEP
- list accommodations
- generate generic strategies

This fails because it does not operate at the level of the task.

Teachers do not need more strategies. They need:
- specific changes to tomorrow’s lesson
- tied to specific student needs
- expressed as concrete actions

This system does that.

---

## Implementation Details

- stdio MCP server (Claude Desktop + Codex)
- structured lesson extraction
- IEP section parsing + summarization
- prompt-driven reasoning with tool grounding
- logging to stderr to preserve JSON stream

---

## Setup: Environment Variables

- LESSON_PDF_PATH
- IEP_PDF_PATH
- ANTHROPIC_API_KEY (optional)

---

## Testing

```bash
npx tsc --noEmit
```

Inspector:
```bash
npx @modelcontextprotocol/inspector connect-stdio "npx tsx src/server.ts"
```

---

## Teacher-Usability Checklist

- Task-specific modifications
- Ready-to-use scripts and materials
- Explicit accommodations (timing, setting, presentation, response)
- Minimal prep required
- Quick execution checklist

---

## Known Limitations

- Single lesson focus
- Minimal retrieval/reranking
- PDF parsing assumptions
