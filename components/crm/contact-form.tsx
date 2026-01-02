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
            setExtractionError(data.error || "Failed to extract contact information");
          }
        } catch (error) {
          setExtractionError(
            error instanceof Error ? error.message : "Failed to extract contact information"
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
      <Button className="rounded-2xl" onClick={() => setIsOpen(true)} type="button">
        <Plus className="mr-2 h-4 w-4" />
        Add Contact
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border bg-background p-8 shadow-lg">
        <h2 className="mb-6 border-b pb-4 font-semibold text-2xl">Add New Contact</h2>
        <Tabs className="w-full" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger className="rounded-xl" value="manual">
              Manual Entry
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value="extract">
              Extract from Image
            </TabsTrigger>
          </TabsList>

          <TabsContent className="space-y-4" value="extract">
            <div className="space-y-4">
              {uploadedImage ? (
                <div className="space-y-4">
                  <div className="relative rounded-lg border p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-sm">{uploadedImage.name}</span>
                      </div>
                      <Button
                        className="h-6 w-6 p-0"
                        onClick={handleRemoveImage}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <img
                      alt="Uploaded contact image"
                      className="max-h-64 w-full rounded-lg border object-contain"
                      src={uploadedImage.url}
                    />
                  </div>

                  {isExtracting && (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Extracting contact information...</span>
                    </div>
                  )}

                  {extractionError && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                      <p className="text-destructive text-sm">{extractionError}</p>
                    </div>
                  )}

                  {!(isExtracting || extractionError) && (
                    <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3">
                      <p className="text-green-700 text-sm dark:text-green-400">
                        Contact information extracted! Switch to "Manual Entry" tab to review and
                        edit.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Upload an image of a business card, contact screenshot, or any image containing
                    contact information.
                  </p>
                  <UploadDropzone
                    accept="image/*"
                    control={control}
                    description={{
                      fileTypes: "Images only",
                      maxFileSize: "10MB",
                      maxFiles: 1,
                    }}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manual">
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
                <Label htmlFor="email">Email</Label>
                <Input
                  className="rounded-xl"
                  id="email"
                  name="email"
                  onChange={handleChange}
                  type="email"
                  value={formData.email}
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
                <Label htmlFor="company">Company</Label>
                <Input
                  className="rounded-xl"
                  id="company"
                  name="company"
                  onChange={handleChange}
                  type="text"
                  value={formData.company}
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  className="rounded-xl"
                  id="role"
                  name="role"
                  onChange={handleChange}
                  type="text"
                  value={formData.role}
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t pt-6">
                <Button
                  className="rounded-2xl"
                  onClick={handleClose}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button className="rounded-2xl" disabled={isSubmitting} type="submit">
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
