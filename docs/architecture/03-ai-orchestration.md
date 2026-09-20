# 03. AI Orchestration

## Stages
1. Discovery
2. Solution proposal
3. Blueprint generation
4. Build task graph generation
5. Task-by-task code generation
6. Validation and repair
7. Refinement classification and re-planning

## Prompt boundaries
Each AI stage has a distinct prompt module and structured response schema. Discovery and solution generation operate on the problem and brief. Blueprint generation consumes dependencies. Build generation consumes the artifact snapshot and the active task.

## Requirements
- use server-side API access only
- validate all structured outputs with Zod
- support demo fixtures when credentials are absent
- capture usage metadata and prompt version
- keep browser code free from secret material

## Failure mode
If validation fails, the system retries in repair mode and does not persist malformed artifacts as complete.
