import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireOwner } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await requireOwner();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message.includes("Forbidden")
      ? 403
      : message.includes("not found")
        ? 404
        : 401;
    return NextResponse.json({ error: message }, { status });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            sessions: true,
            accounts: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireOwner();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message.includes("Forbidden")
      ? 403
      : message.includes("not found")
        ? 404
        : 401;
    return NextResponse.json({ error: message }, { status });
  }

  try {
    const body = await request.json();
    const { email, password, name, role, emailVerified } = body;

    // Validate email
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Validate password
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    // Validate role
    const validRole = role === "ASSISTANT" ? "ASSISTANT" : "OWNER";
    const userRole = validRole as "OWNER" | "ASSISTANT";

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    // Create user using Better Auth's sign-up API internally
    // We'll create the user and account records directly
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        name: name?.trim() || null,
        role: userRole,
        emailVerified: emailVerified === true,
      },
    });

    // Create account with hashed password using Better Auth's password hashing
    // Better Auth stores passwords in the Account table
    // We need to hash the password - Better Auth uses bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: email.trim().toLowerCase(),
        providerId: "credential",
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);

    // Handle Prisma unique constraint violation
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
