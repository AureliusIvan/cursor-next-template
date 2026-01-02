"use client";

import type { Role } from "@prisma/client";
import { UserList } from "@/components/users/user-list";

interface User {
  id: number;
  email: string;
  name: string | null;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    sessions: number;
    accounts: number;
  };
}

interface UsersPageClientProps {
  initialUsers: User[];
}

export function UsersPageClient({ initialUsers }: UsersPageClientProps) {
  return <UserList initialUsers={initialUsers} />;
}
