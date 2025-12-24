import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const NOTION_TOKEN_URL = "https://api.notion.com/v1/oauth/token";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(
          `/dashboard/integrations?error=${encodeURIComponent(error)}`,
          request.url,
        ),
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/dashboard/integrations?error=no_code", request.url),
      );
    }

    // Get current user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.redirect(
        new URL("/login?error=unauthorized", request.url),
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch(NOTION_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`,
        ).toString("base64")}`,
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.NOTION_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Notion token exchange failed:", errorData);
      return NextResponse.redirect(
        new URL(
          "/dashboard/integrations?error=token_exchange_failed",
          request.url,
        ),
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, workspace_id, workspace_name, bot_id } = tokenData;

    // Store or update Notion account in database
    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "notion",
          accountId: workspace_id || bot_id || `notion_${session.user.id}`,
        },
      },
      create: {
        userId: Number(session.user.id),
        providerId: "notion",
        accountId: workspace_id || bot_id || `notion_${session.user.id}`,
        accessToken: access_token,
        scope: JSON.stringify({ workspace_name }),
      },
      update: {
        accessToken: access_token,
        scope: JSON.stringify({ workspace_name }),
      },
    });

    return NextResponse.redirect(
      new URL("/dashboard/integrations?success=connected", request.url),
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard/integrations?error=internal_error", request.url),
    );
  }
}
