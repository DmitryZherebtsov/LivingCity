// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api, { setAuthToken } from "@/lib/api";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "moderator" | "viewer";
  avatar?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "eventmap_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(SESSION_KEY);
    if (s) {
      try {
        const parsed = JSON.parse(s) as UserProfile;
        setUser(parsed);
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const res = await api.post("/auth/login", { email, password });
      // backend returns { accessToken, user }
      const { accessToken: token, user: profile } = res.data;
      if (!token || !profile) {
        return { error: "Invalid server response" };
      }
      // keep token in memory and set global header
      setAccessToken(token);
      setAuthToken(token);
      // persist minimal user profile (no tokens) for UI
      setUser(profile);
      localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
      return {};
    } catch (err: any) {
      // axios error handling
      if (err.response?.data?.error || err.response?.data?.message) {
        return { error: err.response.data.error || err.response.data.message };
      }
      return { error: "Network error" };
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<{ error?: string }> => {
    try {
      // If your backend has /auth/register; if not, remove or implement endpoint
      const res = await api.post("/auth/register", { email, password, name });
      const { accessToken: token, user: profile } = res.data;
      if (!token || !profile) return { error: "Invalid server response" };
      setAccessToken(token);
      setAuthToken(token);
      setUser(profile);
      localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
      return {};
    } catch (err: any) {
      if (err.response?.data?.error || err.response?.data?.message) {
        return { error: err.response.data.error || err.response.data.message };
      }
      return { error: "Network error" };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore network errors on logout
    }
    setUser(null);
    setAccessToken(null);
    setAuthToken(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const getAccessToken = () => accessToken;

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
