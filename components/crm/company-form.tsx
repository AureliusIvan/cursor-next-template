"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CompanyForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    industry: "",
    description: "",
    phone: "",
    address: "",
    size: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/crm/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setIsOpen(false);
        setFormData({
          name: "",
          website: "",
          industry: "",
          description: "",
          phone: "",
          address: "",
          size: "",
        });
        // Company list will update automatically via SSE
      } else {
        toast.error(data.error || "Failed to create company");
      }
    } catch (_error) {
      toast.error("An error occurred while creating the company");
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
        Add Company
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border bg-background p-8 shadow-lg">
        <h2 className="mb-6 border-b pb-4 font-semibold text-2xl">Add New Company</h2>
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
            <Label htmlFor="website">Website</Label>
            <Input
              className="rounded-xl"
              id="website"
              name="website"
              onChange={handleChange}
              type="url"
              value={formData.website}
            />
          </div>

          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              className="rounded-xl"
              id="industry"
              name="industry"
              onChange={handleChange}
              type="text"
              value={formData.industry}
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

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              className="rounded-xl"
              id="phone"
              name="phone"
              onChange={handleChange}
              type="tel"
              value={formData.phone}
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              className="rounded-xl"
              id="address"
              name="address"
              onChange={handleChange}
              type="text"
              value={formData.address}
            />
          </div>

          <div>
            <Label htmlFor="size">Size</Label>
            <Input
              className="rounded-xl"
              id="size"
              name="size"
              onChange={handleChange}
              placeholder="e.g., 1-10, 11-50, 51-200"
              type="text"
              value={formData.size}
            />
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
              {isSubmitting ? "Creating..." : "Create Company"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
