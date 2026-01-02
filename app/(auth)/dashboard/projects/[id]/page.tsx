import { ArrowLeft, Calendar, Clock, Flag, Target } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectDeleteDialog } from "@/components/crm/project-delete-dialog";
import { ProjectEditForm } from "@/components/crm/project-edit-form";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

const priorityLabels: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ARCHIVED: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  URGENT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number.parseInt(id, 10);

  if (Number.isNaN(projectId)) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    notFound();
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            className="mb-4 inline-flex items-center text-muted-foreground text-sm hover:text-foreground"
            href="/dashboard/projects"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-bold text-3xl">{project.name}</h1>
              <div className="mt-2 flex gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-sm ${statusColors[project.status] || ""}`}
                >
                  {statusLabels[project.status]}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-sm ${priorityColors[project.priority] || ""}`}
                >
                  {priorityLabels[project.priority]}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <ProjectEditForm project={project} />
              <ProjectDeleteDialog projectId={project.id} projectName={project.name} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-6">
          {/* Progress */}
          <div className="rounded-3xl border p-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-lg">
              <Target className="h-5 w-5" />
              Progress
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted">
                <div
                  className="h-3 rounded-full bg-primary transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="rounded-3xl border p-6">
              <h2 className="mb-4 font-semibold text-lg">Description</h2>
              <p className="whitespace-pre-wrap text-muted-foreground">{project.description}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-3xl border p-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-lg">
              <Calendar className="h-5 w-5" />
              Timeline
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-muted p-2">
                  <Flag className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Start Date</p>
                  <p className="font-medium">{formatDate(project.startDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-muted p-2">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">End Date</p>
                  <p className="font-medium">{formatDate(project.endDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="rounded-3xl border p-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-lg">
              <Clock className="h-5 w-5" />
              Metadata
            </h2>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(project.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">{formatDate(project.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
