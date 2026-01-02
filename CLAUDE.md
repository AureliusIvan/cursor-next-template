# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

**Always use `bun`** - never npm, yarn, or pnpm. The project requires Bun 1.2.13+.

## Common Commands

```bash
# Development
bun run dev              # Start dev server (logs to .cursor/tmp/runner.log)
bun run build            # Production build
bun run start            # Run production build

# Linting (auto-runs via Cursor hooks on file save)
bun run lint             # Check code
bun run lint:fix         # Auto-fix issues

# Testing
bun run test             # Run tests with Bun test runner
bun run test:watch       # Watch mode

# Database
bun run docker:up        # Start PostgreSQL container
bun run db:migrate       # Run migrations
bun run db:studio        # Open Prisma Studio
bun run db:seed          # Seed database

# AI Development
bun run ai:dev           # Start AI SDK devtools (logs at .devtools/generations.json)
```

## Architecture Overview

This is a Next.js 16 CRM platform with:

- **Frontend**: Next.js App Router, React 19, Tailwind CSS 4, Radix UI components
- **Backend**: Next.js API routes with Better Auth authentication
- **Database**: PostgreSQL via Prisma ORM (client generated to `app/generated/prisma/client`)
- **AI**: Multi-provider support (OpenAI, Anthropic, Google) via AI SDK
- **Search**: Algolia for full-text search
- **Sync**: Notion API integration for contact sync

### Key Directories

```
/app
├── /api/                    # API routes
│   ├── /auth/[...all]/      # Better Auth endpoints
│   ├── /crm/                # CRM endpoints (contacts, companies, sync)
│   └── /chat/               # AI chat endpoint
├── /(auth)/                 # Auth-protected routes (login, signup, dashboard)
├── /components/             # Page-specific components
├── /generated/prisma/       # Generated Prisma client
└── /hooks/                  # React hooks (useContactStream, etc.)

/components                  # Shared UI components
├── /ui/                     # Radix UI wrappers
└── /crm/                    # CRM components

/lib
├── /ai/                     # AI utilities, prompts, tools
├── auth.ts                  # Better Auth server config
├── prisma.ts                # Prisma client singleton
├── debug.ts                 # Debug logging utilities
└── events.ts                # SSE event emitters

/prisma
├── schema.prisma            # Database schema
└── seed.ts                  # Seed script
```

### Data Flow Patterns

1. **API Routes**: REST with JSON responses, SSE for real-time updates
2. **Authentication**: Better Auth with httpOnly cookies, middleware protection in `proxy.ts`
3. **Real-time**: Event emitters trigger SSE streams consumed by React hooks
4. **AI Chat**: Streaming responses via AI SDK with tool calling support

## Coding Conventions

- **File naming**: kebab-case (e.g., `contact-form.tsx`)
- **Components**: PascalCase exports (e.g., `export function ContactForm`)
- **Server vs Client**: Server components by default, add `"use client"` when needed
- **Path alias**: `@/*` maps to project root

## Debugging

Use debug utilities from `lib/debug.ts` instead of raw `console.log`:

```typescript
import { debug, debugError, debugTime } from "@/lib/debug";

debug({ component: "ContactForm" }, "Submitting", { data });
debugError({ component: "API" }, error, { context });
```

### Log Locations

- `.cursor/tmp/runner.log` - Server-side dev logs
- `.cursor/tmp/hooks.log` - Cursor hooks activity
- `.devtools/generations.json` - AI SDK logs

## API Response Pattern

```typescript
try {
  const result = await operation();
  return NextResponse.json({ success: true, data: result });
} catch (error) {
  return NextResponse.json({ error: "Message" }, { status: 500 });
}
```

## Database

Prisma schema at `prisma/schema.prisma`. Key models:
- `User`, `Session`, `Account` - Better Auth managed
- `Contact`, `Company` - CRM entities
- `SyncState` - Notion sync tracking

Generate client after schema changes: `bun run db:generate`
