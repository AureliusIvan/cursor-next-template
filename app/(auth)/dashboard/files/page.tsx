import { Clock } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const dynamic = "force-dynamic";

export default function FilesPage() {
  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="rounded-3xl border border-dashed bg-background p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-semibold text-2xl">Recent Files</h1>
        </div>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Clock className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>No recent files</EmptyTitle>
            <EmptyDescription>Files you've recently opened will appear here</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </main>
  );
}
