import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { NotionDatabase } from "@/lib/types/notion-integration";

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

    if (!notionAccount?.accessToken) {
      return NextResponse.json(
        { error: "Notion not connected" },
        { status: 404 },
      );
    }

    // Fetch databases from Notion
    const response = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${notionAccount.accessToken}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          property: "object",
          value: "database",
        },
        sort: {
          direction: "descending",
          timestamp: "last_edited_time",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Notion API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch databases" },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Transform to simplified format
    const databases: NotionDatabase[] = data.results.map((db: any) => ({
      id: db.id,
      title: db.title?.[0]?.plain_text || "Untitled",
      properties: db.properties || {},
    }));

    return NextResponse.json({ databases });
  } catch (error) {
    console.error("Error fetching Notion databases:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
