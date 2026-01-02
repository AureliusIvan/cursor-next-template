import { headers } from "next/headers";
import { auth } from "./auth";
import prisma from "./prisma";

export async function requireOwner() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Get full user with role from database
  const userId = parseInt(String(session.user.id), 10);
  if (isNaN(userId)) {
    throw new Error("Invalid user ID");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "OWNER") {
    throw new Error("Forbidden: Only OWNER role can access this resource");
  }

  return { session, user };
}
