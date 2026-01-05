"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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

export function ProjectForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "ACTIVE",
    priority: "MEDIUM",
    progress: "0",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/crm/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          progress: Number.parseInt(formData.progress, 10) || 0,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsOpen(false);
        setFormData({
          name: "",
          description: "",
          status: "ACTIVE",
          priority: "MEDIUM",
          progress: "0",
          startDate: "",
          endDate: "",
        });
      } else {
        toast.error(data.error || "Failed to create project");
      }
    } catch (_error) {
      toast.error("An error occurred while creating the project");
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
      <Button className="rounded-2xl" onClick={() => setIsOpen(true)} type="button">
        <Plus className="mr-2 h-4 w-4" />
        Add Project
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border bg-background p-8 shadow-lg">
        <h2 className="mb-6 border-b pb-4 font-semibold text-2xl">Add New Project</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              className="rounded-xl"
              id="name"
              name="name"
              onChange={handleChange}
              required
              type="text"
              value={formData.name}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              className="rounded-xl"
              id="description"
              name="description"
              onChange={handleChange}
              rows={3}
              value={formData.description}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
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
              <Label htmlFor="priority">Priority</Label>
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
            <Label htmlFor="progress">Progress (%)</Label>
            <Input
              className="rounded-xl"
              id="progress"
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
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                className="rounded-xl"
                id="startDate"
                name="startDate"
                onChange={handleChange}
                type="date"
                value={formData.startDate}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                className="rounded-xl"
                id="endDate"
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
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
