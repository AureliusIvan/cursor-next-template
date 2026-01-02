import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let currentUser;
  try {
    const result = await requireOwner();
    currentUser = result.user;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    let status = 401;
    if (message.includes("Forbidden")) {
      status = 403;
    } else if (message.includes("not found")) {
      status = 404;
    }
    return NextResponse.json({ error: message }, { status });
  }

  try {
    const { id } = await params;
    const userId = Number.parseInt(id, 10);

    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, password, role, emailVerified } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent users from changing their own role
    if (currentUser.id === userId && role && role !== existingUser.role) {
      return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
    }

    // Validate email if provided
    if (email !== undefined) {
      if (!email || typeof email !== "string" || !email.trim()) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }

      if (!emailRegex.test(email.trim())) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
      }

      // Check if email is already taken by another user
      const emailUser = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });

      if (emailUser && emailUser.id !== userId) {
        return NextResponse.json({ error: "Email is already taken" }, { status: 400 });
      }
    }

    // Validate password if provided
    if (
      password !== undefined &&
      password !== "" &&
      (typeof password !== "string" || password.length < 8)
    ) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Validate role if provided
    let userRole: "OWNER" | "ASSISTANT" | undefined;
    if (role !== undefined) {
      userRole = role === "ASSISTANT" ? "ASSISTANT" : "OWNER";
    }

    // Update user
    const updateData: {
      name?: string | null;
      email?: string;
      role?: "OWNER" | "ASSISTANT";
      emailVerified?: boolean;
    } = {};

    if (name !== undefined) {
      updateData.name = name?.trim() || null;
    }
    if (email !== undefined) {
      updateData.email = email.trim().toLowerCase();
    }
    if (userRole !== undefined) {
      updateData.role = userRole;
    }
    if (emailVerified !== undefined) {
      updateData.emailVerified = emailVerified === true;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Update password if provided
    if (password !== undefined && password !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update or create account
      const account = await prisma.account.findFirst({
        where: {
          userId,
          providerId: "credential",
        },
      });

      if (account) {
        await prisma.account.update({
          where: { id: account.id },
          data: { password: hashedPassword },
        });
      } else {
        await prisma.account.create({
          data: {
            userId,
            accountId: updatedUser.email,
            providerId: "credential",
            password: hashedPassword,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        emailVerified: updatedUser.emailVerified,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);

    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Email is already taken" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let currentUser;
  try {
    const result = await requireOwner();
    currentUser = result.user;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    let status = 401;
    if (message.includes("Forbidden")) {
      status = 403;
    } else if (message.includes("not found")) {
      status = 404;
    }
    return NextResponse.json({ error: message }, { status });
  }

  try {
    const { id } = await params;
    const userId = Number.parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Prevent users from deleting themselves
    if (currentUser.id === userId) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user (cascades to sessions and accounts)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
