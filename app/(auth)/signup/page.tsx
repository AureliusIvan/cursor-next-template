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
          <h1 className="font-semibold text-2xl text-black dark:text-zinc-50">Sign Up</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Create a new account to get started
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-black text-sm dark:text-zinc-50" htmlFor="name">
              Name
            </label>
            <input
              className="h-12 rounded-lg border border-black/8 bg-white px-4 text-black placeholder:text-zinc-400 focus:border-black/20 focus:outline-none dark:border-white/[.145] dark:bg-[#1a1a1a] dark:text-zinc-50 dark:focus:border-white/30"
              disabled={isLoading}
              id="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              type="text"
              value={name}
            />
          </div>
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
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              type="password"
              value={password}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-500">Minimum 8 characters</p>
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
            {isLoading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <a className="font-medium text-black hover:underline dark:text-zinc-50" href="/login">
            Sign in
          </a>
        </div>
      </main>
    </div>
  );
}
