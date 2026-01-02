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
    emailVerified: initialData?.emailVerified || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (
    field: keyof UserFormData,
    value: string | boolean | Role,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="rounded-xl"
          placeholder="John Doe"
        />
      </div>

      <div>
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="rounded-xl"
          placeholder="user@example.com"
        />
      </div>

      <div>
        <Label htmlFor="password">
          Password {!isEdit && <span className="text-destructive">*</span>}
          {isEdit && (
            <span className="text-muted-foreground text-xs">
              (leave blank to keep current)
            </span>
          )}
        </Label>
        <Input
          type="password"
          id="password"
          required={!isEdit}
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          className="rounded-xl"
          placeholder={isEdit ? "••••••••" : "Enter password"}
          minLength={8}
        />
        <p className="text-muted-foreground text-xs mt-1">
          Must be at least 8 characters
        </p>
      </div>

      <div>
        <Label htmlFor="role">Role</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => handleChange("role", value as Role)}
        >
          <SelectTrigger className="rounded-xl w-full">
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
            id="emailVerified"
            checked={formData.emailVerified}
            onCheckedChange={(checked) =>
              handleChange("emailVerified", checked === true)
            }
          />
          <Label htmlFor="emailVerified" className="cursor-pointer">
            Email Verified
          </Label>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-6 border-t mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium rounded-2xl border border-input bg-background hover:bg-accent transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
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
