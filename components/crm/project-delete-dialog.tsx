"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProjectDeleteDialogProps {
  projectId: number;
  projectName: string;
}

export function ProjectDeleteDialog({ projectId, projectName }: ProjectDeleteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/crm/projects/${projectId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        router.push("/dashboard/projects");
      } else {
        alert(data.error || "Failed to delete project");
        setIsOpen(false);
      }
    } catch (_error) {
      alert("An error occurred while deleting the project");
      setIsOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        className="rounded-2xl"
        onClick={() => setIsOpen(true)}
        type="button"
        variant="destructive"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl border bg-background p-8 shadow-lg">
        <h2 className="mb-4 font-semibold text-2xl">Delete Project</h2>
        <p className="mb-6 text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">{projectName}</span>? This action cannot
          be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            className="rounded-2xl"
            disabled={isDeleting}
            onClick={() => setIsOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="rounded-2xl"
            disabled={isDeleting}
            onClick={handleDelete}
            type="button"
            variant="destructive"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
