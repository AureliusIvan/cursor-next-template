"use client";

import type { Project } from "@prisma/client";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ProjectEditFormProps {
  project: Project;
  onSuccess?: () => void;
}

export function ProjectEditForm({ project, onSuccess }: ProjectEditFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    status: project.status,
    priority: project.priority,
    progress: String(project.progress),
    startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
    endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/crm/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          progress: Number.parseInt(formData.progress, 10) || 0,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsOpen(false);
        onSuccess?.();
      } else {
        alert(data.error || "Failed to update project");
      }
    } catch (_error) {
      alert("An error occurred while updating the project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!isOpen) {
    return (
      <Button
        className="rounded-2xl"
        onClick={() => setIsOpen(true)}
        type="button"
        variant="outline"
      >
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border bg-background p-8 shadow-lg">
        <h2 className="mb-6 border-b pb-4 font-semibold text-2xl">Edit Project</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="edit-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              className="rounded-xl"
              id="edit-name"
              name="name"
              onChange={handleChange}
              required
              type="text"
              value={formData.name}
            />
          </div>

          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              className="rounded-xl"
              id="edit-description"
              name="description"
              onChange={handleChange}
              rows={3}
              value={formData.description}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                value={formData.status}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-priority">Priority</Label>
              <Select
                onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
                value={formData.priority}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="edit-progress">Progress (%)</Label>
            <Input
              className="rounded-xl"
              id="edit-progress"
              max="100"
              min="0"
              name="progress"
              onChange={handleChange}
              type="number"
              value={formData.progress}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-startDate">Start Date</Label>
              <Input
                className="rounded-xl"
                id="edit-startDate"
                name="startDate"
                onChange={handleChange}
                type="date"
                value={formData.startDate}
              />
            </div>

            <div>
              <Label htmlFor="edit-endDate">End Date</Label>
              <Input
                className="rounded-xl"
                id="edit-endDate"
                name="endDate"
                onChange={handleChange}
                type="date"
                value={formData.endDate}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t pt-6">
            <Button
              className="rounded-2xl"
              onClick={() => setIsOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button className="rounded-2xl" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
