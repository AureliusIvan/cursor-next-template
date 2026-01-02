import type { Role } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

interface RoleBadgeProps {
  role: Role;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <Badge
      variant={role === "OWNER" ? "default" : "secondary"}
      className="rounded-full"
    >
      {role}
    </Badge>
  );
}
