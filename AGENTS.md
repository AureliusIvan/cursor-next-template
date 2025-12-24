# Cursor Next.js Template Project

## IMPORTANT
- Always use `bun`; do NOT use `pnpm`,`npm`,`yarn`

## Auto-linting
Automatic linting runs via Cursor hooks after each file edit. The `.cursor/hooks.json` configuration triggers `bun run lint:fix` automatically, so manual linting is not required.

## Debuggable
All components and code must be easy to debug on development environment
- Type safety
- Descriptive variable/function/component names
- Avoid abbreviations unless widely understood
- Strategic console.log/console.error for key flows
- Single responsibility per function/component
- Clear separation of concerns

## Development
- Check ./cursor/tmp/hooks.log for hooks log information everytime modifying the codebase
