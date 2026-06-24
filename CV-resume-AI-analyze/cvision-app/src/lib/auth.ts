import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type AppUser = User;

export type ProfileRecord = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  school?: string | null;
  major?: string | null;
  plan?: string | null;
  role?: string | null;
};

export async function getCurrentUser(): Promise<AppUser | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user ?? null;
}

export async function getAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

export function onAppAuthStateChange(callback: (user: AppUser | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => data.subscription.unsubscribe();
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined,
    },
  });
}

export async function signOutAppUser() {
  return supabase.auth.signOut();
}

export async function sendResetPasswordEmail(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
  });
}

export async function updateCurrentUserPassword(password: string) {
  return supabase.auth.updateUser({ password });
}

export async function getProfile(userId: string): Promise<ProfileRecord | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, school, major, plan, role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function upsertProfile(userId: string, payload: Partial<ProfileRecord>) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      ...payload,
    },
    { onConflict: "id" }
  );

  if (error) {
    throw error;
  }
}
