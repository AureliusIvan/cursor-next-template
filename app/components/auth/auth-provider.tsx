"use client";

import { createContext, type ReactNode, useContext } from "react";
import { authClient } from "@/lib/auth-client";

type AuthContextType = ReturnType<typeof authClient.useSession>;

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = authClient.useSession();

  return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
