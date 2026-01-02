"use client";

import type { Role } from "@prisma/client";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: Role;
  emailVerified: boolean;
}

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  isEdit?: boolean;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function UserForm({
  initialData,
  isEdit = false,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: "",
    role: initialData?.role || "ASSISTANT",
    emailVerified: initialData?.emailVerified,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (field: keyof UserFormData, value: string | boolean | Role) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          className="rounded-xl"
          id="name"
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="John Doe"
          type="text"
          value={formData.name}
        />
      </div>

      <div>
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          className="rounded-xl"
          id="email"
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="user@example.com"
          required
          type="email"
          value={formData.email}
        />
      </div>

      <div>
        <Label htmlFor="password">
          Password {!isEdit && <span className="text-destructive">*</span>}
          {isEdit && (
            <span className="text-muted-foreground text-xs">(leave blank to keep current)</span>
          )}
        </Label>
        <Input
          className="rounded-xl"
          id="password"
          minLength={8}
          onChange={(e) => handleChange("password", e.target.value)}
          placeholder={isEdit ? "••••••••" : "Enter password"}
          required={!isEdit}
          type="password"
          value={formData.password}
        />
        <p className="mt-1 text-muted-foreground text-xs">Must be at least 8 characters</p>
      </div>

      <div>
        <Label htmlFor="role">Role</Label>
        <Select
          onValueChange={(value) => handleChange("role", value as Role)}
          value={formData.role}
        >
          <SelectTrigger className="w-full rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OWNER">OWNER</SelectItem>
            <SelectItem value="ASSISTANT">ASSISTANT</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isEdit && (
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={formData.emailVerified}
            id="emailVerified"
            onCheckedChange={(checked) => handleChange("emailVerified", checked === true)}
          />
          <Label className="cursor-pointer" htmlFor="emailVerified">
            Email Verified
          </Label>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3 border-t pt-6">
        <button
          className="rounded-2xl border border-input bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-accent"
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          className="rounded-2xl bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
              ? "Update User"
              : "Create User"}
        </button>
      </div>
    </form>
  );
}
