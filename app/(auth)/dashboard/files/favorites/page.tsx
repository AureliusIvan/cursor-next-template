import { Star } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="rounded-3xl border border-dashed bg-background p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-semibold text-2xl">Favorites</h1>
        </div>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Star className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>No favorite files</EmptyTitle>
            <EmptyDescription>Files you've marked as favorites will appear here</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </main>
  );
}
