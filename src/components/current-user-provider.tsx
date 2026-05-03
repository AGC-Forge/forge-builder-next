"use client";

import { createContext, useContext, useMemo } from "react";
import type { Profile } from "@/types/database";

export type CurrentUser = {
  id: string;
  email: string | null;
} | null;

type CurrentUserContextValue = {
  user: CurrentUser;
  profile: Profile | null;
  publicSettings: Record<string, string | null>;
};

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({
  user,
  profile,
  publicSettings,
  children,
}: Readonly<{
  user: CurrentUser;
  profile: Profile | null;
  publicSettings: Record<string, string | null>;
  children: React.ReactNode;
}>) {
  const value = useMemo(
    () => ({ user, profile, publicSettings }),
    [user, profile, publicSettings],
  );
  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser must be used within CurrentUserProvider");
  return ctx;
}

export function usePublicSettings() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("usePublicSettings must be used within CurrentUserProvider");
  return ctx.publicSettings;
}

