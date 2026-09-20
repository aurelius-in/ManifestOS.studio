# 01. System Context

## Context
ManifestOS sits between human intent and execution. Users describe a problem in ordinary language. The system interprets that problem, structures it as a project, plans the app, and then generates software artifacts under a constrained, safe sandbox.

## Actors
- end user / problem owner
- AI product specialist
- project system / build orchestrator
- preview sandbox
- versioning and persistence layers
- optional Supabase services

## External systems
- OpenAI model via server-side Responses API
- Supabase Auth and Postgres (when configured)
- preview sandbox provider
- storage provider for generated app files and project versions

## Core principle
The software pipeline is architecture-first, not prompt-first. The build engine consumes artifacts, not the raw initial sentence alone.

## System boundaries
- user interface stays novice-friendly
- AI orchestration remains server-side
- generated apps run in a controlled browser sandbox
- secrets and production credentials stay out of the browser
