# 11. ADRs

## ADR 1: Start from a real problem, not an app prompt
Start the experience with a problem statement and guided discovery, because the user does not need technical app ideas.

## ADR 2: Architecture before code is non-negotiable
The build system must work from the current artifact snapshot. This keeps the app coherent and reduces rebuild churn.

## ADR 3: Safe browser sandbox for generated apps
Generated app code should be rendered in a constrained sandbox rather than executed as arbitrary server-side code.

## ADR 4: Default to demo mode when credentials are absent
The system must work in a deterministic demo configuration so product flows are testable without external services.

## ADR 5: Keep AI orchestration server-side and schema validated
This preserves security and ensures generated outputs are quality-checked before being used to alter project state.
