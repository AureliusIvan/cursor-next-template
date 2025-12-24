# Authentication Documentation

This project uses [Better Auth](https://www.better-auth.com/) for authentication, providing secure email/password authentication with session management.

## Overview

Better Auth is a modern, type-safe authentication library that provides:
- Email/password authentication
- Secure session management with httpOnly cookies
- Built-in CSRF protection
- Type-safe API with TypeScript
- Prisma integration for database operations

## Setup

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database (already configured)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb"

# Better Auth Configuration
# Generate a secret with: openssl rand -base64 32
BETTER_AUTH_SECRET="your-secret-key-here-minimum-32-characters-long"
BETTER_AUTH_URL="http://localhost:3000"
```

**Important**: The `BETTER_AUTH_SECRET` must be at least 32 characters long and should be kept secure. Never commit this to version control.

### Database Schema

Better Auth requires the following tables:
- `User` - Extended with Better Auth fields (emailVerified, image, createdAt, updatedAt)
- `Session` - Stores user sessions
- `Account` - Stores authentication accounts (email/password, OAuth providers)
- `Verification` - Stores email verification tokens

The schema has been merged with the existing Prisma schema. Run migrations to apply:

```bash
bun run db:migrate
```

## Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Client as Auth Client
    participant API as /api/auth/*
    participant Auth as Better Auth
    participant DB as PostgreSQL/Prisma
    participant Proxy as Route Proxy

    User->>Client: Submit Login Form
    Client->>API: POST /api/auth/sign-in/email
    API->>Auth: Process Sign In
    Auth->>DB: Verify Credentials
    DB-->>Auth: User Data
    Auth->>Auth: Create Session
    Auth->>DB: Store Session
    Auth-->>API: Set HttpOnly Cookie
    API-->>Client: Success Response
    Client-->>User: Redirect to Dashboard

    User->>Proxy: Access Protected Route
    Proxy->>API: GET /api/auth/get-session
    API->>Auth: Validate Session Cookie
    Auth->>DB: Fetch Session
    DB-->>Auth: Session Data
    Auth-->>Proxy: Session Valid
    Proxy-->>User: Allow Access
```

## File Structure

### Server-Side

- `lib/auth.ts` - Better Auth server instance configuration
- `app/api/auth/[...all]/route.ts` - API route handler for all auth endpoints
- `proxy.ts` - Route protection middleware (Next.js 16 proxy pattern)

### Client-Side

- `lib/auth-client.ts` - Better Auth React client instance
- `app/(auth)/login/page.tsx` - Login page
- `app/(auth)/signup/page.tsx` - Signup page
- `app/components/auth/protected-route.tsx` - Server component wrapper for protected pages
- `app/components/auth/auth-provider.tsx` - Client-side auth context provider
- `app/components/auth/sign-out-button.tsx` - Sign out button component

### Pages

- `app/page.tsx` - Home page (redirects authenticated users to dashboard)
- `app/(admin)/dashboard/page.tsx` - Protected dashboard page

## Usage

### Client-Side Authentication

#### Sign Up

```typescript
import { authClient } from "@/lib/auth-client";

const { data, error } = await authClient.signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "John Doe",
  callbackURL: "/dashboard",
});
```

#### Sign In

```typescript
import { authClient } from "@/lib/auth-client";

const { data, error } = await authClient.signIn.email({
  email: "user@example.com",
  password: "password123",
  callbackURL: "/dashboard",
});
```

#### Sign Out

```typescript
import { authClient } from "@/lib/auth-client";

await authClient.signOut({
  fetchOptions: {
    onSuccess: () => {
      window.location.href = "/login";
    },
  },
});
```

#### Get Session (Client)

```typescript
import { authClient } from "@/lib/auth-client";

// Using hook (React)
const { data: session, isPending, error } = authClient.useSession();

// Using method
const { data: session, error } = await authClient.getSession();
```

### Server-Side Authentication

#### Get Session (Server)

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({
  headers: await headers(),
});

if (!session?.user) {
  // User is not authenticated
}
```

#### Protect Server Components

```typescript
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return <div>Protected content</div>;
}
```

#### Use Protected Route Wrapper

```typescript
import { ProtectedRoute } from "@/app/components/auth/protected-route";

export default function Page() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

## API Endpoints

Better Auth provides the following endpoints under `/api/auth/*`:

- `POST /api/auth/sign-up/email` - Sign up with email/password
- `POST /api/auth/sign-in/email` - Sign in with email/password
- `POST /api/auth/sign-out` - Sign out current user
- `GET /api/auth/get-session` - Get current session
- `GET /api/auth/get-user` - Get current user

See [Better Auth API Documentation](https://www.better-auth.com/docs/concepts/api) for complete endpoint reference.

## Route Protection

### Using Proxy (Next.js 16)

The `proxy.ts` file handles route protection at the edge:

- Protected routes require authentication
- Unauthenticated users are redirected to `/login` with a `callbackUrl` parameter
- Authenticated users accessing `/login` or `/signup` are redirected to `/dashboard`
- Public routes: `/`, `/login`, `/signup`, `/api/auth/*`

### Protected Routes

Routes under `app/(admin)/` are automatically protected by the proxy. To protect additional routes:

1. Add route protection logic in `proxy.ts`
2. Use the `ProtectedRoute` component wrapper
3. Check session in server components

## Security Considerations

### Session Security

- **httpOnly**: Cookies are automatically httpOnly (prevents XSS attacks)
- **secure**: Cookies are automatically secure in production (HTTPS only)
- **sameSite**: Set to `"lax"` for CSRF protection
- **Session Expiration**: 7 days by default, configurable in `lib/auth.ts`

### CSRF Protection

Better Auth includes built-in CSRF protection. No additional configuration needed.

### Password Security

- Passwords are hashed using bcrypt
- Minimum password length: 8 characters (configurable)
- Passwords are never stored in plain text

### Rate Limiting

Consider implementing rate limiting for authentication endpoints in production:

- Use middleware or API gateway rate limiting
- Consider using services like Upstash Redis for distributed rate limiting
- Document rate limits in API documentation

### Environment Variables

- Never commit `.env` files to version control
- Use `.env.example` as a template
- Rotate `BETTER_AUTH_SECRET` periodically in production
- Use different secrets for development and production

## Troubleshooting

### Session Not Persisting

1. Check that `BETTER_AUTH_URL` matches your application URL
2. Verify cookies are not being blocked by browser settings
3. Ensure `BETTER_AUTH_SECRET` is set correctly
4. Check that database migrations have been applied

### Authentication Fails

1. Verify database connection is working
2. Check that user exists in database
3. Verify password is correct (check hashing)
4. Check browser console for errors
5. Verify API routes are accessible at `/api/auth/*`

### Type Errors

1. Run `bun run db:generate` to regenerate Prisma client
2. Restart TypeScript server in your IDE
3. Check that Better Auth types are imported correctly

### Database Migration Issues

1. Ensure database is running
2. Check `DATABASE_URL` is correct
3. Run `bun run db:migrate` to apply migrations
4. Check migration files in `prisma/migrations/`

## Additional Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
- [Next.js Authentication Guide](https://nextjs.org/docs/app/building-your-application/authentication)

## Code Quality

All authentication code follows:
- **DRY Principle**: Reusable components and utilities
- **SOLID Principles**: Single responsibility, proper abstractions
- **Type Safety**: Full TypeScript support with Better Auth types
- **Error Handling**: Comprehensive error handling in all auth flows
