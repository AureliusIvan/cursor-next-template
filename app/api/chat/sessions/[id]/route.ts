import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

/**
 * GET /api/chat/sessions/[id]
 * Get a chat session with all its messages
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const sessionId = Number.parseInt(id, 10);

    if (Number.isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id, // Ensure user can only access their own sessions
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            role: true,
            content: true,
            metadata: true,
            createdAt: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    let status = 500;
    if (message.includes("Unauthorized")) {
      status = 401;
    } else if (message.includes("not found")) {
      status = 404;
    }
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * DELETE /api/chat/sessions/[id]
 * Delete a chat session and all its messages
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const sessionId = Number.parseInt(id, 10);

    if (Number.isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    // Verify session belongs to user before deleting
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Delete session (messages will be cascade deleted)
    await prisma.chatSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete session";
    let status = 500;
    if (message.includes("Unauthorized")) {
      status = 401;
    } else if (message.includes("not found")) {
      status = 404;
    }
    return NextResponse.json({ error: message }, { status });
  }
}
