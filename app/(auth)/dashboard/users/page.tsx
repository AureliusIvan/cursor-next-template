import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UsersPageClient } from "./users-page-client";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  // Check authentication and authorization
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Get user with role
  const userId = parseInt(String(session.user.id), 10);
  if (isNaN(userId)) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== "OWNER") {
    redirect("/dashboard");
  }

  // Fetch users
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          sessions: true,
          accounts: true,
        },
      },
    },
  });

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="rounded-3xl border border-dashed bg-background p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
        <UsersPageClient initialUsers={users} />
      </div>
    </main>
  );
}
