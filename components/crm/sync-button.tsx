"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/crm/sync", { method: "POST" });
      const data = await response.json();

      if (data.success) {
        const message = data.message;
        const algoliaMessage = data.algoliaSync
          ? data.algoliaSync.success
            ? `Algolia: Synced ${data.algoliaSync.count} contacts`
            : `Algolia: ${data.algoliaSync.error || "Sync failed"}`
          : null;

        toast.success(message, {
          description: algoliaMessage,
          duration: 5000,
        });

        router.refresh(); // Reload data
      } else {
        // Show detailed error message
        const errorMessage = data.error || "Unknown error";
        const errorDetails = data.details
          ? typeof data.details === "string"
            ? data.details
            : JSON.stringify(data.details, null, 2)
          : null;

        toast.error("Sync failed", {
          description: errorMessage + (errorDetails ? `\n\nDetails: ${errorDetails}` : ""),
          duration: 8000,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during sync";
      toast.error("Sync error", {
        description: errorMessage,
        duration: 8000,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      className="rounded-2xl"
      disabled={isSyncing}
      onClick={handleSync}
      type="button"
      variant="outline"
    >
      {isSyncing ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="mr-2 h-4 w-4" />
      )}
      {isSyncing ? "Syncing..." : "Sync Now"}
    </Button>
  );
}
