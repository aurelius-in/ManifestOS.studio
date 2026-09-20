# 06. Security Model

## Principle
The app must be safe by default and honest about readiness.

## Requirements
- no secrets in browser code
- all AI calls server-side
- generated app constraints block dangerous runtime use
- input validation before any generation step
- permissions based on ownership and share tokens
- privacy implications must be documented in the blueprint

## Trust levels
- working preview
- ready for personal use
- ready to share
- ready for production

The app must not claim production readiness simply because code runs.
