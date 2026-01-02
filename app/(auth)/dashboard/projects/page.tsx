import prisma from "@/lib/prisma";
import { ProjectsPageClient } from "./projects-page-client";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <main className="flex-1 p-4 md:p-6">
      <ProjectsPageClient initialProjects={projects} />
    </main>
  );
}
