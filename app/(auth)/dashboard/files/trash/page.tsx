import { Trash2 } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const dynamic = "force-dynamic";

export default async function TrashPage() {
  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="rounded-3xl border border-dashed bg-background p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-semibold text-2xl">Trash</h1>
        </div>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Trash2 className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Trash is empty</EmptyTitle>
            <EmptyDescription>
              Files you delete will be moved to trash and can be restored
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </main>
  );
}
