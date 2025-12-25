"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setIsOpen(false);
        setFormData({ name: "", email: "", phone: "", company: "", role: "" });
        // Contact list will update automatically via SSE
      } else {
        alert(data.error || "Failed to create contact");
      }
    } catch (_error) {
      alert("An error occurred while creating the contact");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        Add Contact
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-3xl border p-8 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 pb-4 border-b">Add New Contact</h2>
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
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="rounded-xl"
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
            <Label htmlFor="company">Company</Label>
            <Input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
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
              {isSubmitting ? "Creating..." : "Create Contact"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
