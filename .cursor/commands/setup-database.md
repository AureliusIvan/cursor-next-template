# Setup Database Command

## 1. Ask user which provider/ORM they want to use:
- **Prisma** (PostgreSQL, MySQL, SQLite, MongoDB, etc.) - https://www.prisma.io/docs/getting-started
- **Drizzle ORM** (PostgreSQL, MySQL, SQLite) - https://orm.drizzle.team/docs/overview
- **Supabase** (PostgreSQL) - https://supabase.com/docs/guides/database
- **Turso** (SQLite) - https://docs.turso.tech/
- **Neon** (PostgreSQL) - https://neon.tech/docs
- **PlanetScale** (MySQL) - https://planetscale.com/docs
- **MongoDB** (with Mongoose or native driver) - https://www.mongodb.com/docs/
- **Raw SQL** (PostgreSQL, MySQL, SQLite with native drivers)
- Others (Paste the DOCS url)

## 2. Analyze Deeply on How to Implement the Database System
- Assume the docs change rapidly, thus need to re-check latest documentation
- Analyze project directory & current setup
- Identify key files to edit/create
- Determine if using App Router or Pages Router (this project uses App Router)
- Check for existing database configuration or connection files
- Identify where to place database utilities, types, and connection logic

## 3. Start creating blueprint using plan mode
- Show how database connection and queries will work using mermaid diagram
- Map out database schema structure (if applicable)
- Plan migration strategy (if using ORM with migrations)
- Identify where database utilities will be located (`lib/db`, `utils/db`, etc.)

## 4. Start Executing
- Install required packages (use `bun` not npm/yarn/pnpm)
- Set up database connection configuration
- Create database utility files (connection pool, client initialization)
- Set up environment variables in `.env.example` (connection strings, credentials)
- Create TypeScript types for database models/schemas
- Set up migration system (if using ORM with migrations)
- Create initial schema/migrations if needed
- Add database query utilities/helpers if appropriate

## 5. Testing & Verification
- Test database connection (create simple connection test)
- Verify CRUD operations work correctly
- Test connection pooling (if applicable)
- Check error handling for connection failures
- Verify environment variables are properly loaded
- Test migrations (if applicable)
- Ensure TypeScript types are correctly inferred

## 6. Code Review & Security Review
- Connection string security (never commit secrets)
- SQL injection prevention (use parameterized queries/ORM)
- Connection pool limits and timeout configuration
- Error handling and logging strategy
- Ensure created code follows DRY & SOLID principles
- Verify proper TypeScript typing throughout
- Check for connection leaks or improper resource cleanup
- Review database access patterns (server-side only, no client exposure)

## 7. Documentation
- Confirm to user if all targets have been fulfilled
- Create documentation at `/docs/database.md` with:
  - Connection setup instructions
  - Environment variables required
  - How to run migrations (if applicable)
  - Example queries/usage patterns
  - Troubleshooting common issues
