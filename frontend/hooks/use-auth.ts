"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { clearAuthCookie, getAuthCookie, setAuthCookie } from "@/lib/cookies";
import { useAuthStore } from "@/store/auth-store";
import type { User } from "@/lib/types";

interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export function useAuth() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [isHydrating, setIsHydrating] = useState(true);

  // On mount: if a token cookie exists but we don't have a user in the
  // store yet (e.g. first load in a new tab), fetch the profile once.
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const token = getAuthCookie();
      if (!token) {
        setIsHydrating(false);
        return;
      }
      if (user) {
        setIsHydrating(false);
        return;
      }
      try {
        const me = await api.get<User>("/api/auth/me");
        if (!cancelled) setUser(me);
      } catch {
        clearAuthCookie();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const res = await api.post<TokenResponse>("/api/auth/register", payload, {
        auth: false,
      });
      setAuthCookie(res.access_token);
      setUser(res.user);
      router.push("/dashboard");
    },
    [router, setUser]
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      const res = await api.post<TokenResponse>("/api/auth/login", payload, {
        auth: false,
      });
      setAuthCookie(res.access_token);
      setUser(res.user);
      router.push("/dashboard");
    },
    [router, setUser]
  );

  const logout = useCallback(() => {
    clearAuthCookie();
    setUser(null);
    router.push("/login");
  }, [router, setUser]);

  return { user, isHydrating, register, login, logout };
}

export { ApiError };
