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
        alert(data.message); // Replace with toast in real app
        router.refresh(); // Reload data
      } else {
        alert("Sync failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      alert("An error occurred during sync");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
