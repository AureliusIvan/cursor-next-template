"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

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
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase bg-black dark:bg-white text-white dark:text-black border-3 border-black dark:border-white shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:shadow-[6px_6px_0px_0px_#000000] dark:hover:shadow-[6px_6px_0px_0px_#ffffff] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
      >
        <Plus className="w-5 h-5" />
        Add Contact
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 dark:bg-white dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white p-8 w-full max-w-md shadow-[8px_8px_0px_0px_#000000] dark:shadow-[8px_8px_0px_0px_#ffffff]">
        <h2 className="text-2xl font-black uppercase mb-6 pb-4 border-b-4 border-black dark:border-white text-black dark:text-white">Add New Contact</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-bold uppercase mb-2 text-black dark:text-white">
              Name <span className="text-black dark:text-white">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border-3 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000000] dark:focus:shadow-[2px_2px_0px_0px_#ffffff] font-medium"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase mb-2 text-black dark:text-white">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-3 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000000] dark:focus:shadow-[2px_2px_0px_0px_#ffffff] font-medium"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-bold uppercase mb-2 text-black dark:text-white">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border-3 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000000] dark:focus:shadow-[2px_2px_0px_0px_#ffffff] font-medium"
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-xs font-bold uppercase mb-2 text-black dark:text-white">
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-3 border-3 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000000] dark:focus:shadow-[2px_2px_0px_0px_#ffffff] font-medium"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-xs font-bold uppercase mb-2 text-black dark:text-white">
              Role
            </label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border-3 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000000] dark:focus:shadow-[2px_2px_0px_0px_#ffffff] font-medium"
            />
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t-3 border-black dark:border-white mt-6">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-6 py-3 text-sm font-bold uppercase bg-white dark:bg-zinc-900 text-black dark:text-white border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_#000000] dark:shadow-[3px_3px_0px_0px_#ffffff] hover:shadow-[5px_5px_0px_0px_#000000] dark:hover:shadow-[5px_5px_0px_0px_#ffffff] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-sm font-bold uppercase text-white dark:text-black bg-black dark:bg-white border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_#000000] dark:shadow-[3px_3px_0px_0px_#ffffff] hover:shadow-[5px_5px_0px_0px_#000000] dark:hover:shadow-[5px_5px_0px_0px_#ffffff] hover:translate-x-[-2px] hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? "Creating..." : "Create Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
