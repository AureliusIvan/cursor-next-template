import { NextResponse } from "next/server";
import { companyEvents } from "@/lib/events";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search")?.trim();

    if (!searchQuery) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    const companies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: searchQuery, mode: "insensitive" } },
          { website: { contains: searchQuery, mode: "insensitive" } },
          { industry: { contains: searchQuery, mode: "insensitive" } },
          { phone: { contains: searchQuery, mode: "insensitive" } },
          { address: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ companies });
  } catch (error) {
    return NextResponse.json({ error: "Failed to search companies" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, website, industry, description, phone, address, size } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        website: website?.trim() || null,
        industry: industry?.trim() || null,
        description: description?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        size: size?.trim() || null,
      },
    });

    // Emit event for SSE subscribers
    companyEvents.emit("company.created", company);

    return NextResponse.json({ success: true, company });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }
}
