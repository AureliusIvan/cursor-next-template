"use client";

import type { Role } from "@prisma/client";
import { format } from "date-fns";
import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateUserDialog } from "./create-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { RoleBadge } from "./role-badge";
import { UserSessionsDialog } from "./user-sessions-dialog";

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

interface UserListProps {
  initialUsers: User[];
}

export function UserList({ initialUsers }: UserListProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionsDialogOpen, setSessionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      (user.name && user.name.toLowerCase().includes(query))
    );
  });

  const handleRefresh = async () => {
    try {
      const response = await fetch("/api/users");
      const result = await response.json();
      if (response.ok && result.users) {
        setUsers(result.users);
      }
    } catch (error) {
      console.error("Failed to refresh users:", error);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleViewSessions = (user: User) => {
    setSelectedUser(user);
    setSessionsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="rounded-2xl pl-9"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            type="search"
            value={searchQuery}
          />
        </div>
        <Button className="rounded-2xl" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="flex h-96 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed">
          <p className="text-muted-foreground">
            {searchQuery ? "No users found matching your search." : "No users found."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-dashed bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email Verified</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || "-"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    {user.emailVerified ? (
                      <Badge className="rounded-full" variant="outline">
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="rounded-full text-muted-foreground" variant="outline">
                        Not Verified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(user.createdAt), "PPp")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        className="h-8 w-8 rounded-xl"
                        onClick={() => handleViewSessions(user)}
                        size="icon"
                        title="View Sessions"
                        variant="ghost"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        className="h-8 w-8 rounded-xl"
                        onClick={() => handleEdit(user)}
                        size="icon"
                        title="Edit User"
                        variant="ghost"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        className="h-8 w-8 rounded-xl text-destructive hover:text-destructive"
                        onClick={() => handleDelete(user)}
                        size="icon"
                        title="Delete User"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateUserDialog
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleRefresh}
        open={createDialogOpen}
      />

      <EditUserDialog
        onOpenChange={setEditDialogOpen}
        onSuccess={handleRefresh}
        open={editDialogOpen}
        user={selectedUser}
      />

      <DeleteUserDialog
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleRefresh}
        open={deleteDialogOpen}
        user={selectedUser}
      />

      <UserSessionsDialog
        onOpenChange={setSessionsDialogOpen}
        open={sessionsDialogOpen}
        user={selectedUser}
      />
    </div>
  );
}
