"use client";

import type { Role } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserForm } from "./user-form";

interface User {
  id: number;
  email: string;
  name: string | null;
  role: Role;
  emailVerified: boolean;
}

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: Role;
  emailVerified: boolean;
}

export function EditUserDialog({ open, onOpenChange, user, onSuccess }: EditUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      const updateData: {
        name?: string;
        email?: string;
        password?: string;
        role?: Role;
        emailVerified?: boolean;
      } = {
        name: data.name,
        email: data.email,
        role: data.role,
        emailVerified: data.emailVerified,
      };

      // Only include password if it's provided
      if (data.password && data.password.trim() !== "") {
        updateData.password = data.password;
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update user");
      }

      toast.success("User updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Leave password blank to keep the current password.
          </DialogDescription>
        </DialogHeader>
        <UserForm
          initialData={{
            name: user.name || "",
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
          }}
          isEdit
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
