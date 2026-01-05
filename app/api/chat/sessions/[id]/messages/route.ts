import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

/**
 * POST /api/chat/sessions/[id]/messages
 * Save a message to a chat session
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const sessionId = Number.parseInt(id, 10);

    if (Number.isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    // Verify session belongs to user
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const body = await request.json();
    const { role, content, metadata } = body as {
      role: string;
      content: string;
      metadata?: unknown;
    };

    if (!(role && content)) {
      return NextResponse.json({ error: "Role and content are required" }, { status: 400 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        sessionId,
        role,
        content,
        metadata: metadata ?? undefined,
      },
      select: {
        id: true,
        role: true,
        content: true,
        metadata: true,
        createdAt: true,
      },
    });

    // Update session updatedAt timestamp
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    // If this is the first user message and session has no title, generate title from content
    if (role === "user" && !session.title) {
      const firstUserMessage = await prisma.chatMessage.findFirst({
        where: {
          sessionId,
          role: "user",
        },
        orderBy: { createdAt: "asc" },
      });

      if (firstUserMessage?.id === message.id) {
        // Generate title from first 50 characters
        const title = content.slice(0, 50).trim();
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { title },
        });
      }
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save message";
    let status = 500;
    if (message.includes("Unauthorized")) {
      status = 401;
    } else if (message.includes("not found")) {
      status = 404;
    }
    return NextResponse.json({ error: message }, { status });
  }
}
