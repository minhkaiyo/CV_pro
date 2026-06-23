"use client";

/**
 * useAuthGuard — Redirects to /login if the user is not authenticated.
 *
 * Returns { user, loading } so the caller can show a spinner while
 * Firebase initializes. Uses onAuthStateChanged so it reacts to
 * sign-in / sign-out events in real time.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";

export function useAuthGuard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (!firebaseUser) {
        router.replace("/login");
      }
    });
    return unsubscribe;
  }, [router]);

  return { user, loading };
}
