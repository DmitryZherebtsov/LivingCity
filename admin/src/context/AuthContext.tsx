import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { setAuthToken } from "@/lib/api";
import { refreshSession, login as loginRequest, register as registerRequest, logout as logoutRequest, StaffProfile } from "@/services/authService";
import { getErrorMessage } from "@/lib/utils";

export type UserProfile = StaffProfile;

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

      const data = await refreshSession();
      const token = data?.accessToken;
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
      const { accessToken: token, user: profile } = await loginRequest(email, password);
      if (!token || !profile) {
        return { error: "Invalid server response" };
      }
      setAccessToken(token);
      setAuthToken(token);

      setUser(profile);
      localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
      return {};
    } catch (err) {
      return { error: getErrorMessage(err, "Network error") };
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<{ error?: string }> => {
    try {
      const { accessToken: token, user: profile } = await registerRequest(email, password, name);

      if (token && profile) {
        setAccessToken(token);
        setAuthToken(token);
        setUser(profile);
        localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
      }

      return {};
    } catch (err) {
      return { error: getErrorMessage(err, "Network error") };
    }
  };

  const logout = async (): Promise<void> => {
    await logoutRequest().catch(() => {});
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
