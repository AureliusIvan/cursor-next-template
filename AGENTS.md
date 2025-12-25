# Cursor Next.js Template Project

## IMPORTANT
- Always use `bun`; do NOT use `pnpm`,`npm`,`yarn`

## Naming Conventions
- Always use kebab-case for component file naming

## Auto-linting
Automatic linting runs via Cursor hooks after each file edit. The `.cursor/hooks.json` configuration triggers `bunx biome check --write` on edited files automatically (equivalent to `bun run lint:fix` but runs on individual files), so manual linting is not required.

## Debuggable
All components and code must be easy to debug on development environment
- Type safety
- Descriptive variable/function/component names
- Avoid abbreviations unless widely understood
- Strategic console.log/console.error for key flows
- Single responsibility per function/component
- Clear separation of concerns

### Client-Side Debugging

#### Source Maps
- Source maps are enabled in development mode (`tsconfig.json` and `next.config.ts`)
- Original TypeScript code is visible in browser DevTools
- Use `.vscode/launch.json` for Cursor IDE debugging with breakpoints

#### Debug Utilities (`lib/debug.ts`)
Use debug utilities instead of raw `console.log` for consistent, development-only logging:

```typescript
import { debug, debugError, debugTime, debugGroup } from "@/lib/debug";

// Basic debug logging
debug({ component: "LoginForm", function: "handleSubmit" }, "User submitted form", { email });

// Error logging with stack traces
debugError({ component: "AuthProvider" }, error, { userId });

// Performance timing
debugTime("fetchUserData", { component: "UserProfile" });
// ... async operation ...
debugTimeEnd("fetchUserData", { component: "UserProfile" });

// Grouped logs
debugGroup("Authentication Flow", () => {
  debug("Step 1: Validate credentials");
  debug("Step 2: Create session");
});
```

#### Development Helpers (`lib/dev-utils.ts`)
Use development-only utilities to ensure code is stripped in production:

```typescript
import { isDev, devOnly, devAssert, devWarn } from "@/lib/dev-utils";

// Check development mode
if (isDev()) {
  // Development-only code
}

// Execute function only in development
const result = devOnly(() => expensiveDebugOperation(), undefined);

// Assertions in development
devAssert(user !== null, "User must be authenticated");

// Development warnings
devWarn("Deprecated API usage", { component: "LegacyComponent" });
```

#### Error Boundaries (`app/components/debug/error-boundary.tsx`)
Wrap components with ErrorBoundary to catch and display errors gracefully:

```typescript
import { ErrorBoundary } from "@/app/components/debug/error-boundary";

<ErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling
  }}
>
  <YourComponent />
</ErrorBoundary>
```

#### Cursor IDE Debugging
1. **Server-side debugging**: Use "Next.js: debug server-side" configuration
2. **Client-side debugging**: Use "Next.js: debug client-side" configuration (requires Chrome/Edge)
3. **Full stack debugging**: Use "Next.js: debug full stack" for both server and client
4. Set breakpoints directly in TypeScript files - they will work with source maps

#### Best Practices
- Use `debug()` instead of `console.log()` for development logging
- Use `debugError()` for error logging with context
- Wrap major components with ErrorBoundary
- Use `debugTime()`/`debugTimeEnd()` for performance debugging
- All debug utilities automatically disable in production builds
- Use `isDev()` checks for development-only features

## Development
- Check `.cursor/tmp/hooks.log` for hooks log information everytime modifying the codebase
- Update USER-CHOICE.md if user setup new configurations (create one if NOT EXIST; refer to USER-CHOICE-TEMPLATE.md)
- for AI development, view the logs on .devtools/generations.json
