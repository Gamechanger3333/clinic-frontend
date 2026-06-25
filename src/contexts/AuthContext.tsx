"use client";

/**
 * src/contexts/AuthContext.tsx — Enterprise Auth Context
 *
 * - Fetches user on mount via /api/auth/me
 * - Tracks email verification status + MFA status
 * - Provides CSRF token management
 * - signOut / signOutAll helpers
 * - refreshUser for post-login / post-action state sync
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id:              string;
  email:           string;
  fullName:        string;
  role:            string;
  phone?:          string | null;
  avatarUrl?:      string | null;
  isEmailVerified: boolean;
  mfaEnabled:      boolean;
  lastLoginAt?:    string | null;
}

interface AuthContextType {
  user:          AuthUser | null;
  loading:       boolean;
  csrfToken:     string;
  signOut:       () => Promise<void>;
  signOutAll:    () => Promise<void>;
  refreshUser:   () => Promise<AuthUser | null>;
  refreshCsrf:   () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const router = useRouter();

  // ── Fetch + cache CSRF token ─────────────────────────────────────────────
  const refreshCsrf = useCallback(async () => {
    try {
      const res  = await fetch("/api/auth/csrf-token");
      const data = await res.json();
      if (data.csrfToken) setCsrfToken(data.csrfToken);
    } catch {
      // non-critical — individual requests can retry
    }
  }, []);

  // ── Fetch current user ───────────────────────────────────────────────────
  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const { user } = await res.json();
        setUser(user);
        return user;
      } else {
        setUser(null);
        return null;
      }
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    Promise.all([refreshUser(), refreshCsrf()]).finally(() => setLoading(false));
  }, [refreshUser, refreshCsrf]);

  // ── Sign out current session ─────────────────────────────────────────────
  const signOut = async () => {
    await fetch("/api/auth/logout", {
      method:  "POST",
      headers: { "X-CSRF-Token": csrfToken },
    });
    setUser(null);
    setCsrfToken("");
    router.push("/auth");
  };

  // ── Sign out ALL sessions ────────────────────────────────────────────────
  const signOutAll = async () => {
    await fetch("/api/auth/logout-all", {
      method:  "POST",
      headers: { "X-CSRF-Token": csrfToken },
    });
    setUser(null);
    setCsrfToken("");
    router.push("/auth");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, csrfToken, signOut, signOutAll, refreshUser, refreshCsrf }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// ── Typed role guard hook ─────────────────────────────────────────────────────
export function useRequireRole(roles: string[]) {
  const { user, loading } = useAuth();
  return {
    allowed: !loading && !!user && roles.includes(user.role),
    loading,
    user,
  };
}