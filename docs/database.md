# Database Setup Guide

This project uses [Prisma ORM](https://www.prisma.io/) for database access and management.

## Overview

Prisma provides a type-safe database client with automatic migrations, schema management, and excellent TypeScript support. The setup uses PostgreSQL by default, but can be configured for other databases.

## Prerequisites

- A PostgreSQL database (local or cloud)
- Node.js/Bun runtime
- Environment variables configured
- Docker and Docker Compose (optional, for local development)

## Quick Start with Docker Compose

The easiest way to get started is using the included Docker Compose setup:

1. **Start PostgreSQL**:
   ```bash
   bun run docker:up
   ```

2. **Wait for database to be ready** (takes a few seconds on first run)

3. **Run migrations**:
   ```bash
   bun run db:migrate
   ```

4. **Seed the database** (optional):
   ```bash
   bun run db:seed
   ```

The database will be available at `localhost:5432` with:
- **User**: `postgres`
- **Password**: `postgres`
- **Database**: `mydb`

### Docker Commands

- `bun run docker:up` - Start PostgreSQL container
- `bun run docker:down` - Stop PostgreSQL container
- `bun run docker:logs` - View PostgreSQL logs
- `bun run docker:restart` - Restart PostgreSQL container

To stop and remove the database (data will persist in volume):
```bash
bun run docker:down
```

To remove the database and all data:
```bash
docker-compose down -v
```

## Environment Variables

Create a `.env` file in the project root (use `.env.example` as a template):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
```

### Connection String Formats

- **PostgreSQL**: `postgresql://user:password@host:port/database?schema=public`
- **MySQL**: `mysql://user:password@host:port/database`
- **SQLite**: `file:./dev.db`
- **MongoDB**: `mongodb://user:password@host:port/database`

## Installation

Dependencies are already installed. If you need to reinstall:

```bash
bun install
```

## Database Schema

The schema is defined in `prisma/schema.prisma`. Current models:

- **User**: User accounts with email and name
- **Post**: Blog posts with title, content, and author relationship

## Prisma Commands

### Generate Prisma Client

Generate the Prisma Client after schema changes:

```bash
bun run db:generate
```

This creates type-safe database access code in `app/generated/prisma/client`.

### Run Migrations

Create and apply migrations:

```bash
bun run db:migrate
```

This will:
1. Create a new migration file
2. Apply it to your database
3. Regenerate Prisma Client

### Deploy Migrations (Production)

Apply pending migrations without creating new ones:

```bash
bun run db:migrate:deploy
```

### Open Prisma Studio

Visual database browser:

```bash
bun run db:studio
```

Opens a web interface at `http://localhost:5555` to browse and edit your database.

### Seed Database

Populate the database with initial data:

```bash
bun run db:seed
```

## Usage in Code

### Import Prisma Client

```typescript
import prisma from "@/lib/prisma";
```

### Example Queries

#### Create a User

```typescript
const user = await prisma.user.create({
  data: {
    email: "user@example.com",
    name: "John Doe",
  },
});
```

#### Find Users

```typescript
// Find all users
const users = await prisma.user.findMany();

// Find user with posts
const userWithPosts = await prisma.user.findUnique({
  where: { email: "user@example.com" },
  include: { posts: true },
});
```

#### Create a Post

```typescript
const post = await prisma.post.create({
  data: {
    title: "My Post",
    content: "Post content here",
    published: true,
    authorId: 1,
  },
});
```

#### Update Data

```typescript
const updatedUser = await prisma.user.update({
  where: { id: 1 },
  data: { name: "Jane Doe" },
});
```

#### Delete Data

```typescript
await prisma.post.delete({
  where: { id: 1 },
});
```

### Using in Next.js

#### Server Components

```typescript
// app/users/page.tsx
import prisma from "@/lib/prisma";

export default async function UsersPage() {
  const users = await prisma.user.findMany();
  
  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

#### API Routes

```typescript
// app/api/users/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await prisma.user.create({
    data: body,
  });
  return NextResponse.json(user);
}
```

## Testing Connection

Test your database connection:

```bash
bun lib/db-connection.test.ts
```

Or import and use in code:

```typescript
import { testDatabaseConnection } from "@/lib/db-connection.test";

await testDatabaseConnection();
```

## Troubleshooting

### Connection Errors

**Error: `DATABASE_URL` environment variable is not set**

- Ensure `.env` file exists in project root
- Check that `DATABASE_URL` is set correctly
- Verify `prisma.config.ts` imports `dotenv/config`

**Error: Connection refused**

- Verify database server is running
- Check connection string host/port
- Ensure database exists
- Verify firewall/network settings

**Error: Authentication failed**

- Verify username and password in connection string
- Check database user permissions
- Ensure user has access to the database

### Migration Issues

**Error: Migration failed**

- Check database connection
- Verify schema changes are valid
- Review migration files in `prisma/migrations/`
- Consider resetting database (development only): `prisma migrate reset`

**Error: Prisma Client not generated**

- Run `bun run db:generate`
- Check `prisma/schema.prisma` syntax
- Verify generator output path is correct

### Type Errors

**Error: Cannot find module `@/lib/prisma`**

- Ensure Prisma Client is generated: `bun run db:generate`
- Check TypeScript path aliases in `tsconfig.json`
- Restart TypeScript server in your IDE

**Error: Property does not exist on type**

- Regenerate Prisma Client after schema changes
- Check schema model definitions
- Verify correct import path

## Best Practices

1. **Always use migrations** - Never edit the database directly in production
2. **Type safety** - Let Prisma generate types, don't write them manually
3. **Connection pooling** - The singleton pattern in `lib/prisma.ts` handles this
4. **Error handling** - Wrap database calls in try-catch blocks
5. **Server-side only** - Never expose Prisma Client to the browser
6. **Environment variables** - Never commit `.env` files

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API Reference](https://www.prisma.io/docs/orm/prisma-client)
- [Next.js with Prisma Guide](https://www.prisma.io/docs/guides/nextjs)
- [Database Connection Strings](https://www.prisma.io/docs/orm/overview/databases)

## Project Structure

```
prisma/
  ├── schema.prisma      # Database schema definition
  ├── seed.ts            # Database seeding script
  └── migrations/        # Migration files

lib/
  ├── prisma.ts          # Prisma Client singleton
  └── db-connection.test.ts  # Connection test utility

app/generated/prisma/client/  # Generated Prisma Client (auto-generated)
```
