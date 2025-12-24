import { NextResponse } from "next/server";
import { contactEvents } from "@/lib/events";
import prisma from "@/lib/prisma";

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

    return NextResponse.json({ success: true, contact });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 },
    );
  }
}
