import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-6 rounded-lg border border-black/8 bg-white p-8 dark:border-white/[.145] dark:bg-[#1a1a1a]">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-bold text-6xl text-black dark:text-zinc-50">404</h1>
          <h2 className="font-semibold text-2xl text-black dark:text-zinc-50">Page Not Found</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button asChild className="w-full rounded-full">
            <Link href="/">Go to Home</Link>
          </Button>
          <Button asChild className="w-full rounded-full" variant="outline">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
