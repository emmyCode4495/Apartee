"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  provider?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error?: string }>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_KEY = "apartee_demo_user";

function mapUser(user: User): AuthUser {
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || "",
    fullName:
      meta.full_name ||
      meta.name ||
      meta.fullName ||
      (user.email ? user.email.split("@")[0] : "Guest"),
    avatarUrl: meta.avatar_url || meta.picture || undefined,
    provider: user.app_metadata?.provider || meta.provider || "email",
  };
}

function readDemoUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeDemoUser(user: AuthUser | null) {
  try {
    if (user) localStorage.setItem(DEMO_KEY, JSON.stringify(user));
    else localStorage.removeItem(DEMO_KEY);
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!configured) {
        const demo = readDemoUser();
        if (mounted) {
          setUser(demo);
          setLoading(false);
        }
        return;
      }

      const supabase = createClient();
      if (!supabase) {
        if (mounted) setLoading(false);
        return;
      }

      const {
        data: { session: s },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ? mapUser(s.user) : null);
      setLoading(false);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, next) => {
        setSession(next);
        setUser(next?.user ? mapUser(next.user) : null);
      });

      return () => subscription.unsubscribe();
    }

    const cleanup = init();
    return () => {
      mounted = false;
      void cleanup.then((unsub) => unsub?.());
    };
  }, [configured]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!configured) {
        // Demo mode: accept any valid-looking credentials
        if (!email.includes("@") || password.length < 4) {
          return { error: "Enter a valid email and password (min 4 characters)." };
        }
        const demo: AuthUser = {
          id: `demo-${btoa(email).slice(0, 12)}`,
          email,
          fullName: email.split("@")[0],
          provider: "email",
        };
        writeDemoUser(demo);
        setUser(demo);
        return {};
      }

      const supabase = createClient();
      if (!supabase) return { error: "Auth is not available." };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    },
    [configured]
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      if (!configured) {
        if (!email.includes("@") || password.length < 4) {
          return { error: "Enter a valid email and password (min 4 characters)." };
        }
        const demo: AuthUser = {
          id: `demo-${btoa(email).slice(0, 12)}`,
          email,
          fullName: fullName.trim() || email.split("@")[0],
          provider: "email",
        };
        writeDemoUser(demo);
        setUser(demo);
        return {};
      }

      const supabase = createClient();
      if (!supabase) return { error: "Auth is not available." };
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim() },
        },
      });
      if (error) return { error: error.message };
      return {};
    },
    [configured]
  );

  const signInWithGoogle = useCallback(
    async (redirectTo?: string) => {
      if (!configured) {
        // Demo Google sign-in
        const demo: AuthUser = {
          id: "demo-google-user",
          email: "you@gmail.com",
          fullName: "Google Guest",
          avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
          provider: "google",
        };
        writeDemoUser(demo);
        setUser(demo);
        if (redirectTo && typeof window !== "undefined") {
          window.location.href = redirectTo;
        }
        return {};
      }

      const supabase = createClient();
      if (!supabase) return { error: "Auth is not available." };

      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const next = redirectTo || "/";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) return { error: error.message };
      return {};
    },
    [configured]
  );

  const signOut = useCallback(async () => {
    if (!configured) {
      writeDemoUser(null);
      setUser(null);
      return;
    }
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, [configured]);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      configured,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
    }),
    [user, session, loading, configured, signIn, signUp, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
