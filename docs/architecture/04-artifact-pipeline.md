# 04. Artifact Pipeline

## Dependency order
1. Problem Brief
2. Solution Brief
3. Users and Jobs To Be Done
4. MVP Scope
5. Non-Goals / Not Yet
6. User Flows
7. Feature Specification
8. Data Model
9. System Architecture
10. ADRs
11. Integrations / External Services
12. Privacy and Security Notes
13. Failure Modes / Edge Cases
14. Acceptance Criteria
15. Test Plan
16. Implementation Plan
17. Build Task Graph

## Rules
- generate sequentially, not as one giant call
- validate structure before persistence
- when the user changes scope or architecture, invalidate downstream artifacts
- require build tasks to be produced before any code generation step
