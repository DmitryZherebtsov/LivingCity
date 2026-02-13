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
  const bootstrapAuth = async () => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        setUser(JSON.parse(session));
      }

      const res = await api.post("/auth/refresh", {});
      const token = res.data?.accessToken;
      if (!token) throw new Error("No token");

      setAccessToken(token);
      setAuthToken(token); 

    } catch (e) {
      setUser(null);
      setAuthToken(null);
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoading(false); 
    }
  };

  bootstrapAuth();
}, []);


  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { accessToken: token, user: profile } = res.data;
      if (!token || !profile) {
        return { error: "Invalid server response" };
      }
      // keep token in state
      setAccessToken(token);
      setAuthToken(token);
      // user profile 
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

  const register = async (email: string, password: string, name?: string): Promise<{ error?: string }> => {
  try {
    const res = await api.post("/auth/register", { email, password, name });

    const token = res.data?.accessToken;
    const profile = res.data?.user;

    if (token && profile) {
      setAccessToken(token);
      setAuthToken(token);
      setUser(profile);
      localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
      return {};
    }

    return {};

  } catch (err: any) {
    if (err.response?.data?.error || err.response?.data?.message) {
      return { error: err.response.data.error || err.response.data.message };
    }
    return { error: "Network error" };
  }
};


  const logout = async (): Promise<void> => {
    await api.post("/auth/logout").catch(() => {});
    setAccessToken(null);
    setAuthToken(null);
    setUser(null);
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
