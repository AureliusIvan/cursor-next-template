"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
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
        alert(data.error || "Failed to create company");
      }
    } catch (_error) {
      alert("An error occurred while creating the company");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!isOpen) {
    return (
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-2xl"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Company
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-3xl border p-8 w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-6 pb-4 border-b">
          Add New Company
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              type="text"
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="rounded-xl"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="size">Size</Label>
            <Input
              type="text"
              id="size"
              name="size"
              value={formData.size}
              onChange={handleChange}
              placeholder="e.g., 1-10, 11-50, 51-200"
              className="rounded-xl"
            />
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="rounded-2xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl"
            >
              {isSubmitting ? "Creating..." : "Create Company"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
