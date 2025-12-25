"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
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
        let message = data.message;
        if (data.algoliaSync) {
          if (data.algoliaSync.success) {
            message += `\nAlgolia: Synced ${data.algoliaSync.count} contacts`;
          } else {
            message += `\nAlgolia: ${data.algoliaSync.error || "Sync failed"}`;
          }
        }
        alert(message); // Replace with toast in real app
        router.refresh(); // Reload data
      } else {
        alert(`Sync failed: ${data.error || "Unknown error"}`);
      }
    } catch (_error) {
      alert("An error occurred during sync");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleSync}
      disabled={isSyncing}
      variant="outline"
      className="rounded-2xl"
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
