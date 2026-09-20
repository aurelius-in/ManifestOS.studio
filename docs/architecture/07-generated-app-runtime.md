# 07. Generated App Runtime

## Runtime target
MVP will generate browser-side React / TypeScript apps rendered in a sandbox. No arbitrary server code is executed by the ManifestOS server.

## Safety constraints
- allowlisted dependencies only
- path validation and path traversal checks
- no executable shell scripts
- no secrets or tokens embedded in generated files
- restricted browser APIs unless explicitly approved

## Execution model
The generated app is stored as build outputs and rendered in the sandbox. A future provider interface will allow remote execution providers such as E2B without redesigning the core system.
