# 02. Domain Model

## Domain entities
- User
- Project
- DiscoveryMessage
- ProblemBrief
- SolutionProposal
- Artifact
- Build
- GeneratedFile
- ProjectVersion
- ChangeRequest

## Relationships
A User owns many Projects. Each Project contains discovery messages, artifact versions, builds, and generated files. A Project can move through a guided lifecycle from problem submission to share-ready preview.

## Key business rules
- Projects are tied to a single user by default.
- Artifacts must be versioned and traceable to the selected solution.
- Builds must be based on the current artifact snapshot.
- Changes that alter requirements or architecture must update upstream artifacts first.
