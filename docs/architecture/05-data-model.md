# 05. Data Model

## Storage model
Use Supabase Postgres when configured, with a repository/service abstraction to keep the rest of the app technology-agnostic.

## Core entities
- projects
- project_versions
- discovery_messages
- artifacts
- builds
- generated_files
- change_requests

## Rules
- RLS is required for project ownership and visibility
- public projects can be read publicly
- unlisted projects require secure tokens
- only owners can mutate project state
- artifacts inherit project-level permissions
