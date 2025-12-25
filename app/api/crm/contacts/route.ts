import { NextResponse } from "next/server";
import { contactEvents } from "@/lib/events";
import prisma from "@/lib/prisma";
import { upsertContactToAlgolia } from "@/lib/sync/algolia";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search")?.trim();

    if (!searchQuery) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 },
      );
    }

    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { name: { contains: searchQuery, mode: "insensitive" } },
          { email: { contains: searchQuery, mode: "insensitive" } },
          { phone: { contains: searchQuery, mode: "insensitive" } },
          { company: { contains: searchQuery, mode: "insensitive" } },
          { role: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to search contacts" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, company, role } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const contact = await prisma.contact.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        role: role?.trim() || null,
      },
    });

    // Emit event for SSE subscribers
    contactEvents.emit("contact.created", contact);

    // Sync to Algolia (non-blocking)
    upsertContactToAlgolia(contact).catch((error) => {
      console.error("Failed to sync contact to Algolia:", error);
    });

    return NextResponse.json({ success: true, contact });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 },
    );
  }
}
