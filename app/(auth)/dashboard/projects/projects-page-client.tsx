"use client";

import type { Project } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { Download } from "lucide-react";
import { ProjectForm } from "@/components/crm/project-form";
import { ProjectList } from "@/components/crm/project-list";
import { Button } from "@/components/ui/button";

interface ProjectsPageClientProps {
  initialProjects: Project[];
}

export function ProjectsPageClient({ initialProjects }: ProjectsPageClientProps) {
  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="font-semibold text-2xl">Projects</h1>
        <div className="hidden gap-2 md:flex">
          <Button className="rounded-2xl" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <ProjectForm />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="rounded-3xl border border-dashed bg-background p-6">
            <ProjectList initialProjects={initialProjects} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
