import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/app/components/auth/sign-out-button";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col gap-8 px-8 py-16">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
                Dashboard
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Welcome back, {session.user.name || session.user.email}!
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>

        <div className="rounded-lg border border-black/8 bg-white p-6 dark:border-white/[.145] dark:bg-[#1a1a1a]">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
            Session Information
          </h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-zinc-600 dark:text-zinc-400">
                User ID:
              </span>{" "}
              <span className="text-black dark:text-zinc-50">
                {session.user.id}
              </span>
            </div>
            <div>
              <span className="font-medium text-zinc-600 dark:text-zinc-400">
                Email:
              </span>{" "}
              <span className="text-black dark:text-zinc-50">
                {session.user.email}
              </span>
            </div>
            {session.user.name && (
              <div>
                <span className="font-medium text-zinc-600 dark:text-zinc-400">
                  Name:
                </span>{" "}
                <span className="text-black dark:text-zinc-50">
                  {session.user.name}
                </span>
              </div>
            )}
            {session.session && (
              <div>
                <span className="font-medium text-zinc-600 dark:text-zinc-400">
                  Session ID:
                </span>{" "}
                <span className="text-black dark:text-zinc-50">
                  {session.session.id}
                </span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
