# AGENT Operating Instructions

Purpose and Scope
- Build an MCP server that enables an LLM (e.g., Claude) to generate specific, actionable instructional modifications for a given lesson and a given student’s IEP.
- Optimize for teacher-ready outputs grounded explicitly in both curriculum and IEP data, with clear provenance.

Deliverables and Timeline (from Challenge README)
- Public GitHub repo with:
  - Setup/run instructions (Node 18+ or Python 3.10+, Anthropic API key or Claude Desktop)
  - Architecture rationale/trade-offs
  - 1–2 high-quality example outputs
- Submission: email the repo link to isaac@waypoint-learning.org
- Deadline: Monday, May 11 @ 12pm ET
- Judging criteria: output quality, architecture choices, code quality, domain understanding (UDL, teacher workflow)

Success Definition
- A teacher can take the generated plan into class today with minimal edits.
- Each recommendation has clear grounding in both the lesson and the IEP, with explicit references.

Current Project State
- Stack confirmed: TypeScript MCP server.
- `src/server.ts` now runs a real MCP server over stdio using the MCP SDK (`McpServer` + `StdioServerTransport`).
- Registered MCP resources:
  - `lesson://raw`
  - `lesson://model`
  - `iep://summary`
- Registered MCP tool:
  - `get_iep_section(section, goalId?)` as a placeholder returning not-yet-implemented structured output.
- Registered MCP prompt:
  - `differentiate_lesson_for_student(lessonUri, iepUri, focus?)` as a Claude-facing instruction prompt that tells the model to read resources, optionally call `get_iep_section`, and produce teacher-ready differentiated supports.
- `README.md` has been updated to document stdio/MCP client setup and current project commands.
- `package.json` now includes:
  - `build` script: `tsc --noEmit`
  - `zod` dependency for MCP schema registration
  - `@types/pdf-parse` in devDependencies
- PDF extraction utilities exist under `src/pdf` and are the next likely source for wiring real resource content.

Guiding Principles
- Grounding first: Always attach provenance (file path, section/heading, span when possible).
- Teacher usability: Concrete, low-cognitive-load outputs with scripts, materials, and quick checklists.
- Minimal viable architecture: Do one lesson extremely well before generalizing.
- Incremental development: Ship a thin, working end-to-end slice, then deepen.
- Privacy and ethics: Anonymize student data; minimize reproduction of sensitive content.

MCP Server Design (baseline)
- Resources
  - lesson/* exposed as hierarchical resources (unit → lesson → objectives, materials, procedure steps, checks, assessments, vocab)
  - iep/* exposed as structured sections (present levels by domain, goals/objectives, accommodations/modifications, testing, services)
- Tools (representative)
  - get_lesson_section(id|path): return specific lesson chunk(s) by semantic section
  - get_iep_section(section|goal_id): return present levels, goals, accommodations by id/heading
  - search(query, scope=lesson|iep|both, k): hybrid BM25/embedding search returning snippets + anchors
- Chunking strategy
  - Lesson: natural boundaries (overview, objectives, materials, procedure steps, checks for understanding, assessments)
  - IEP: present-level domains, each goal/objective as its own chunk, accommodations by list items, service/testing notes
- Retrieval
  - Hybrid keyword + embeddings with lightweight re-ranking
  - Always attach provenance metadata: resource path, section/heading, offsets when available

Reasoning Framework (IEP ↔ lesson mapping)
- Parse lesson demands
  - Knowledge/skills, language load, text complexity, task structure, pacing, materials/tools
- Parse IEP signals
  - Present levels: strengths/needs by domain (reading, writing, math, attention/executive, behavior, speech/language, etc.)
  - Goals/objectives: target skills, criteria, timelines
  - Accommodations/modifications: environment, presentation, response, timing/scheduling, assistive tech
- Map needs ↔ lesson demands
  - Identify barriers and opportunities per lesson step; choose supports aligned to goals/accommodations
- Produce modifications grouped by type
  - Access supports: vocabulary pre-teach, visuals, sentence frames, glossaries
  - Process supports: chunking, guided notes, worked examples, manipulatives, graphic organizers
  - Product alternatives: reduced item sets, formats (oral/video/poster), scribing, multiple modalities
  - Assessment modifications: criteria aligned to IEP goals, adjusted rubrics, alternative checks for understanding
  - Accommodation reminders: timing, setting, presentation, response, assistive tech
  - Progress monitoring hooks: observable behaviors, quick data probes, frequency/duration tallies
- Validate against IEP
  - Every recommendation references at least one IEP element and a specific lesson element it modifies

Teacher-Facing Output Specification
- For each lesson step/assessment item include:
  - What to do: concrete teacher move (actionable, stepwise)
  - Why it helps: tie to IEP goal/accommodation/present-level need
  - Materials: links or quick-create instructions (templates, organizers, sentence frames)
  - Student-facing language: ready to read/paste script
  - Assessment/criteria changes: rubric adjustments, alternative demonstrations
  - Accommodation reminders: timing/setting/presentation/response categories
  - References: lesson section path + IEP section/goal id
- Include:
  - Overview summary (1–2 paragraphs)
  - Quick execution checklist (2–3 items)

Quality Bar (evaluation alignment)
- Highly specific, actionable, and grounded with explicit provenance
- Clear architecture decisions and rationale documented in README
- Clean, readable code with basic tests where feasible
- Sound domain understanding (UDL, practical classroom workflow)

Implementation Plan (thin slice)
1) Parse and expose lesson and IEP as MCP resources preserving headings/structure.
2) Implement search with provenance across lesson/IEP (hybrid retrieval + re-ranking).
3) Author a prompt + reasoning chain template that consumes retrieved context and emits teacher-ready modifications per spec.
4) Produce 1–2 example outputs; validate with checklist (specificity, alignment, usability) and iterate.
5) Refine chunking/re-ranking only if outputs lack grounding or specificity.

Operational Rules for This Project Environment
- File/tool limits
  - View at most seven files at a time; read/update incrementally (read ≤3, then update) to stay within limits.
  - Use tasks for work needing more than a handful of file ops; add TODOs and update status (Queued → In Progress → Done/Stuck).
  - After at most six tool calls, update the task with findings/progress or noted dead ends.
  - Respect cost/time: budget is limited; avoid unnecessary reads/writes or external calls.
- Communication style
  - Be concise, structured, action-oriented; prefer bullet lists and checklists.
  - State assumptions when information is missing; request clarifications as needed.

Safeguards and Ethics
- Anonymize student data; avoid reproducing full IEP text unless strictly necessary for provenance.
- No speculative diagnoses; stay within documented needs/goals.
- Accessibility first: offer multimodal supports (visuals, audio, manipulatives) and plain language.

Teacher-Usability Checklist (apply to every output)
- Is each recommendation tied to a specific lesson step or assessment item?
- Is there a ready-to-use script or exemplar where appropriate?
- Are necessary materials enumerated and lightweight to create?
- Are accommodations explicitly listed with timing/setting/presentation/response categories?
- Is there a 2–3 item quick checklist for class execution?
- Are references to lesson/IEP sections included with provenance?

Decision Log (lightweight)
- Record major choices about:
  - Chunking boundaries (lesson/IEP) and id scheme
  - Retrieval approach (BM25/embeddings, re-ranking) and thresholds
  - Output templating and validation steps
  - Failure modes observed and mitigations
- Entries:
  - 00: Start with lesson/IEP chunking by headings; revise if retrieval shows leakage or missed context.
  - 01: Use hybrid search with small-k re-ranking; increase k only if recall issues observed.
  - 02: Converted the initial HTTP-style scaffold into a real MCP stdio server before wiring retrieval, so clients can discover resources/tools/prompts through the proper protocol early.
  - 03: Keep the current server surface thin and explicit (3 resources, 1 placeholder tool, 1 prompt) until parsed lesson/IEP data is wired in.

Open Questions and Assumptions
- Model preference: Claude 3.5 Sonnet by default; configurable.
- Target grade/subject focus for the first worked example: assume ELA middle school unless directed.
- Sample data currently appears to be local PDFs (`iep.pdf` and `lesson/lesson.pdf`).
- Assumption: near-term work should prioritize grounding/provenance over broad feature surface.

Next Actions (execution checklist)
- [x] Confirm language/stack and model
- [ ] Inspect sample lesson and IEP directories; map headings → chunk schema
- [ ] Wire `lesson://raw` to actual lesson PDF extraction output
- [ ] Wire `iep://summary` to actual parsed/condensed IEP output
- [ ] Connect `get_iep_section` to real parsed IEP sections with provenance metadata
- [ ] Decide whether `lesson://model` should be derived from deterministic parsing, `src/llm`, or a hybrid path
- [ ] Implement search (BM25 + small embedding model) with anchors
- [ ] Generate first worked example through the MCP surface
- [ ] Validate with teacher-usability checklist and iterate
- [ ] Document architecture rationale/trade-offs and add example outputs to repo
