"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Session {
  id: number;
  token: string;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface User {
  id: number;
  email: string;
  name: string | null;
}

interface UserSessionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserSessionsDialog({
  open,
  onOpenChange,
  user,
}: UserSessionsDialogProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchSessions();
    }
  }, [open, user]);

  const fetchSessions = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}/sessions`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch sessions");
      }

      setSessions(result.sessions || []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch sessions",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const activeSessions = sessions.filter(
    (session) => new Date(session.expiresAt) > new Date(),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sessions for {user.name || user.email}</DialogTitle>
          <DialogDescription>
            View all active and expired sessions for this user.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No sessions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {activeSessions.length} active session
              {activeSessions.length !== 1 ? "s" : ""}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead>User Agent</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Expires At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => {
                  const isExpired = new Date(session.expiresAt) < new Date();
                  return (
                    <TableRow key={session.id}>
                      <TableCell>{session.ipAddress || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {session.userAgent || "-"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(session.createdAt), "PPp")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(session.expiresAt), "PPp")}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            isExpired
                              ? "bg-muted text-muted-foreground"
                              : "bg-green-500/10 text-green-600 dark:text-green-400"
                          }`}
                        >
                          {isExpired ? "Expired" : "Active"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
