"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/dashboard",
      });

      if (signUpError) {
        setError(signUpError.message || "Sign up failed");
        return;
      }

      if (data) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-6 rounded-lg border border-black/8 bg-white p-8 dark:border-white/[.145] dark:bg-[#1a1a1a]">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Sign Up
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Create a new account to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-black dark:text-zinc-50"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 rounded-lg border border-black/8 bg-white px-4 text-black placeholder:text-zinc-400 focus:border-black/20 focus:outline-none dark:border-white/[.145] dark:bg-[#1a1a1a] dark:text-zinc-50 dark:focus:border-white/30"
              placeholder="John Doe"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-black dark:text-zinc-50"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-lg border border-black/8 bg-white px-4 text-black placeholder:text-zinc-400 focus:border-black/20 focus:outline-none dark:border-white/[.145] dark:bg-[#1a1a1a] dark:text-zinc-50 dark:focus:border-white/30"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-black dark:text-zinc-50"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="h-12 rounded-lg border border-black/8 bg-white px-4 text-black placeholder:text-zinc-400 focus:border-black/20 focus:outline-none dark:border-white/[.145] dark:bg-[#1a1a1a] dark:text-zinc-50 dark:focus:border-white/30"
              placeholder="••••••••"
              disabled={isLoading}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Minimum 8 characters
            </p>
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            {isLoading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-black hover:underline dark:text-zinc-50"
          >
            Sign in
          </a>
        </div>
      </main>
    </div>
  );
}
