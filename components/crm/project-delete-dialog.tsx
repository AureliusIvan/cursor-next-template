"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProjectDeleteDialogProps {
  projectId: number;
  projectName: string;
}

export function ProjectDeleteDialog({
  projectId,
  projectName,
}: ProjectDeleteDialogProps) {
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
        type="button"
        variant="destructive"
        onClick={() => setIsOpen(true)}
        className="rounded-2xl"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-3xl border p-8 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Delete Project</h2>
        <p className="text-muted-foreground mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">{projectName}</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
            className="rounded-2xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-2xl"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
