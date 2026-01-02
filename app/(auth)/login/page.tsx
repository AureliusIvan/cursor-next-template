"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { authClient } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error: signInError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: callbackUrl,
      });

      if (signInError) {
        setError(signInError.message || "Login failed");
        return;
      }

      if (data) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-6 rounded-lg border border-black/8 bg-white p-8 dark:border-white/[.145] dark:bg-[#1a1a1a]">
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold text-2xl text-black dark:text-zinc-50">Sign In</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Enter your credentials to access your account
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-black text-sm dark:text-zinc-50" htmlFor="email">
              Email
            </label>
            <input
              className="h-12 rounded-lg border border-black/8 bg-white px-4 text-black placeholder:text-zinc-400 focus:border-black/20 focus:outline-none dark:border-white/[.145] dark:bg-[#1a1a1a] dark:text-zinc-50 dark:focus:border-white/30"
              disabled={isLoading}
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-black text-sm dark:text-zinc-50" htmlFor="password">
              Password
            </label>
            <input
              className="h-12 rounded-lg border border-black/8 bg-white px-4 text-black placeholder:text-zinc-400 focus:border-black/20 focus:outline-none dark:border-white/[.145] dark:bg-[#1a1a1a] dark:text-zinc-50 dark:focus:border-white/30"
              disabled={isLoading}
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              type="password"
              value={password}
            />
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-2 text-red-600 text-sm dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          <button
            className="flex h-12 w-full items-center justify-center rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-[#ccc]"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Don't have an account?{" "}
          <a className="font-medium text-black hover:underline dark:text-zinc-50" href="/signup">
            Sign up
          </a>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
          <div className="text-black dark:text-zinc-50">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
