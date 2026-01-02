"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { debug, debugError } from "@/lib/debug";

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignOut = async () => {
    setError("");
    setIsLoading(true);

    try {
      debug({ component: "SignOutButton", function: "handleSignOut" }, "Initiating sign out");

      const { error: signOutError } = await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            debug(
              { component: "SignOutButton", function: "handleSignOut" },
              "Sign out successful, redirecting to login"
            );
            window.location.href = "/login";
          },
        },
      });

      if (signOutError) {
        const error = new Error(
          signOutError.message ||
            `Sign out failed: ${signOutError.statusText || signOutError.status}`
        );
        debugError({ component: "SignOutButton", function: "handleSignOut" }, error, {
          code: signOutError.code,
          status: signOutError.status,
        });
        setError(signOutError.message || "Failed to sign out");
        setIsLoading(false);
        return;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      debugError(
        { component: "SignOutButton", function: "handleSignOut" },
        err instanceof Error ? err : new Error(errorMessage)
      );
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        aria-busy={isLoading}
        aria-label={isLoading ? "Signing out..." : "Sign out"}
        className="flex h-10 items-center justify-center gap-2 rounded-full border border-black/8 bg-white px-5 font-medium text-black text-sm transition-colors hover:bg-black/4 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[.145] dark:bg-[#1a1a1a] dark:text-zinc-50 dark:hover:bg-white/5"
        disabled={isLoading}
        onClick={handleSignOut}
        type="button"
      >
        {isLoading && <Spinner className="size-4" />}
        {isLoading ? "Signing out..." : "Sign Out"}
      </button>
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-red-600 text-sm dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
