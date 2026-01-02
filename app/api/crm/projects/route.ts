import { NextResponse } from "next/server";
import { projectEvents } from "@/lib/events";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search")?.trim();
    const statusFilter = searchParams.get("status");
    const priorityFilter = searchParams.get("priority");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    if (statusFilter) {
      where.status = statusFilter;
    }

    if (priorityFilter) {
      where.priority = priorityFilter;
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ projects });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      status,
      priority,
      progress,
      startDate,
      endDate,
    } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Validate progress is between 0-100
    const progressValue = progress
      ? Math.min(100, Math.max(0, Number(progress)))
      : 0;

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        status: status || "ACTIVE",
        priority: priority || "MEDIUM",
        progress: progressValue,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    // Emit event for SSE subscribers
    projectEvents.emit("project.created", project);

    return NextResponse.json({ success: true, project });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}
