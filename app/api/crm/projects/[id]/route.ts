import { NextResponse } from "next/server";
import { projectEvents } from "@/lib/events";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const projectId = Number.parseInt(id, 10);

    if (Number.isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const projectId = Number.parseInt(id, 10);

    if (Number.isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, status, priority, progress, startDate, endDate } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      if (!name || name.trim() === "") {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (priority !== undefined) {
      updateData.priority = priority;
    }

    if (progress !== undefined) {
      updateData.progress = Math.min(100, Math.max(0, Number(progress)));
    }

    if (startDate !== undefined) {
      updateData.startDate = startDate ? new Date(startDate) : null;
    }

    if (endDate !== undefined) {
      updateData.endDate = endDate ? new Date(endDate) : null;
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    });

    // Emit event for SSE subscribers
    projectEvents.emit("project.updated", project);

    return NextResponse.json({ success: true, project });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const projectId = Number.parseInt(id, 10);

    if (Number.isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const project = await prisma.project.delete({
      where: { id: projectId },
    });

    // Emit event for SSE subscribers
    projectEvents.emit("project.deleted", { id: projectId });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
