"use client";

import type { Project } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useProjectStream } from "@/app/hooks/use-project-stream";

interface ProjectListProps {
  initialProjects: Project[];
  searchQuery?: string;
}

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

export function ProjectList({ initialProjects, searchQuery }: ProjectListProps) {
  const streamProjects = useProjectStream({ initialProjects });
  const [searchProjects, setSearchProjects] = useState<Project[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch search results when searchQuery changes
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      setSearchProjects([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const fetchSearchResults = async () => {
      try {
        const response = await fetch(`/api/crm/projects?search=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        if (response.ok) {
          setSearchProjects(data.projects || []);
        } else {
          setSearchProjects([]);
        }
      } catch (error) {
        setSearchProjects([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  // Use search results when searching, otherwise use stream projects
  const projects = searchQuery && searchQuery.trim() !== "" ? searchProjects : streamProjects;

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {isSearching ? (
        <div className="flex h-96 items-center justify-center rounded-3xl border border-dashed">
          <p className="text-muted-foreground">Searching...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex h-96 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed">
          <p className="text-muted-foreground">No projects found.</p>
          <p className="text-muted-foreground text-sm">
            {searchQuery && searchQuery.trim() !== ""
              ? "Try a different search term."
              : "Add a project to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              className="cursor-pointer rounded-2xl border bg-card p-5 transition-colors hover:bg-accent"
              href={`/dashboard/projects/${project.id}`}
              key={project.id}
            >
              <div className="mb-3 border-b pb-3">
                <h3 className="truncate font-semibold text-lg">{project.name}</h3>
                <div className="mt-2 flex gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${statusColors[project.status] || ""}`}
                  >
                    {project.status}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${priorityColors[project.priority] || ""}`}
                  >
                    {project.priority}
                  </span>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {project.description && (
                  <p className="line-clamp-2 text-muted-foreground">{project.description}</p>
                )}
                <div>
                  <div className="mb-1 flex justify-between text-muted-foreground text-xs">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between pt-2 text-muted-foreground text-xs">
                  <span>Start: {formatDate(project.startDate)}</span>
                  <span>End: {formatDate(project.endDate)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
