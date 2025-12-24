import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { NotionIntegrationConfig } from "@/lib/types/notion-integration";

export async function POST(request: Request) {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { databaseId, fieldMapping } = body as NotionIntegrationConfig;

    // Validate input
    if (!databaseId || !fieldMapping) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get user's Notion account
    const notionAccount = await prisma.account.findFirst({
      where: {
        userId: Number(session.user.id),
        providerId: "notion",
      },
    });

    if (!notionAccount) {
      return NextResponse.json(
        { error: "Notion not connected" },
        { status: 404 },
      );
    }

    // Parse existing scope
    let existingScope = {};
    try {
      existingScope = notionAccount.scope
        ? JSON.parse(notionAccount.scope as string)
        : {};
    } catch (e) {
      console.error("Failed to parse existing scope:", e);
    }

    // Update account with new configuration
    await prisma.account.update({
      where: {
        id: notionAccount.id,
      },
      data: {
        scope: JSON.stringify({
          ...existingScope,
          databaseId,
          fieldMapping,
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving Notion config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's Notion account
    const notionAccount = await prisma.account.findFirst({
      where: {
        userId: Number(session.user.id),
        providerId: "notion",
      },
    });

    if (!notionAccount?.scope) {
      return NextResponse.json({ config: null });
    }

    try {
      const config = JSON.parse(notionAccount.scope as string);
      return NextResponse.json({ config });
    } catch (e) {
      console.error("Failed to parse config:", e);
      return NextResponse.json({ config: null });
    }
  } catch (error) {
    console.error("Error fetching Notion config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete user's Notion account
    await prisma.account.deleteMany({
      where: {
        userId: Number(session.user.id),
        providerId: "notion",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting Notion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
