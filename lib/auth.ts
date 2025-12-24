import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  basePath: "/api/auth",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || "",
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
  advanced: {
    database: {
      generateId: "serial", // Use numeric IDs to match existing User model
    },
    // Security: Cookies are automatically httpOnly and secure in production
    // CSRF protection is built-in via Better Auth
    cookies: {
      session_token: {
        attributes: {
          sameSite: "lax", // CSRF protection
          // httpOnly and secure are automatically set by Better Auth
        },
      },
    },
  },
});
