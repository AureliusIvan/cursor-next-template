import type { Role } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

interface RoleBadgeProps {
  role: Role;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <Badge className="rounded-full" variant={role === "OWNER" ? "default" : "secondary"}>
      {role}
    </Badge>
  );
}
