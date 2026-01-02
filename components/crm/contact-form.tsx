"use client";

import { useUploadFiles } from "@better-upload/client";
import { ImageIcon, Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadDropzone } from "@/components/upload-dropzone";

export function ContactForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
  });

  // File upload hook for contact extraction
  const { control } = useUploadFiles({
    route: "contactExtraction",
    onUploadComplete: async (files: any) => {
      if (files && files.length > 0) {
        const file = files[0];
        setUploadedImage({ url: file.url, name: file.name });
        setIsExtracting(true);
        setExtractionError(null);

        try {
          const response = await fetch("/api/crm/contacts/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: file.url }),
          });

          const data = await response.json();

          if (data.success && data.contact) {
            // Pre-fill form with extracted data
            setFormData({
              name: data.contact.name || "",
              email: data.contact.email || "",
              phone: data.contact.phone || "",
              company: data.contact.company || "",
              role: data.contact.role || "",
            });
            // Switch to manual tab to show the filled form
            setActiveTab("manual");
          } else {
            setExtractionError(
              data.error || "Failed to extract contact information",
            );
          }
        } catch (error) {
          setExtractionError(
            error instanceof Error
              ? error.message
              : "Failed to extract contact information",
          );
        } finally {
          setIsExtracting(false);
        }
      }
    },
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
        handleClose();
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

  const handleClose = () => {
    setIsOpen(false);
    setActiveTab("manual");
    setUploadedImage(null);
    setExtractionError(null);
    setFormData({ name: "", email: "", phone: "", company: "", role: "" });
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setExtractionError(null);
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
      <div className="bg-background rounded-3xl border p-8 w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-6 pb-4 border-b">
          Add New Contact
        </h2>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="manual" className="rounded-xl">
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="extract" className="rounded-xl">
              Extract from Image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="extract" className="space-y-4">
            <div className="space-y-4">
              {!uploadedImage ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upload an image of a business card, contact screenshot, or
                    any image containing contact information.
                  </p>
                  <UploadDropzone
                    control={control}
                    accept="image/*"
                    description={{
                      fileTypes: "Images only",
                      maxFileSize: "10MB",
                      maxFiles: 1,
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg border p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {uploadedImage.name}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <img
                      src={uploadedImage.url}
                      alt="Uploaded contact image"
                      className="w-full rounded-lg border max-h-64 object-contain"
                    />
                  </div>

                  {isExtracting && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Extracting contact information...</span>
                    </div>
                  )}

                  {extractionError && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                      <p className="text-sm text-destructive">
                        {extractionError}
                      </p>
                    </div>
                  )}

                  {!isExtracting && !extractionError && (
                    <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3">
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Contact information extracted! Switch to "Manual Entry"
                        tab to review and edit.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manual">
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
                  onClick={handleClose}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
