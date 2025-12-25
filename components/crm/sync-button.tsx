"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

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
    <button
      type="button"
      onClick={handleSync}
      disabled={isSyncing}
      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold uppercase bg-black dark:bg-white text-white dark:text-black border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_#000000] dark:shadow-[3px_3px_0px_0px_#ffffff] hover:shadow-[5px_5px_0px_0px_#000000] dark:hover:shadow-[5px_5px_0px_0px_#ffffff] hover:translate-x-[-2px] hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      {isSyncing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
      {isSyncing ? "Syncing..." : "Sync Now"}
    </button>
  );
}
