"use client";

/**
 * useAuthGuard — Redirects to /login if the user is not authenticated.
 *
 * Returns { user, loading } so the caller can show a spinner while
 * Supabase initializes. Uses auth state changes so it reacts to
 * sign-in / sign-out events in real time.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, onAppAuthStateChange, type AppUser } from "./auth";

export function useAuthGuard() {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getCurrentUser().then((currentUser) => {
      if (!active) return;
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        router.replace("/login");
      }
    });

    const unsubscribe = onAppAuthStateChange((appUser) => {
      if (!active) return;
      setUser(appUser);
      setLoading(false);
      if (!appUser) {
        router.replace("/login");
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  return { user, loading };
}
