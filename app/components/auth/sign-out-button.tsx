"use client";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = "/login";
            },
          },
        });
      }}
      className="flex h-10 items-center justify-center rounded-full border border-black/8 bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-black/4 dark:border-white/[.145] dark:bg-[#1a1a1a] dark:text-zinc-50 dark:hover:bg-white/[.05]"
    >
      Sign Out
    </button>
  );
}
