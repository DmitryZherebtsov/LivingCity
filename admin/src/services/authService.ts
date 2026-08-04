import api from "@/lib/api";

export interface StaffProfile {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "moderator" | "viewer";
  avatar?: string;
  createdAt?: string;
  organizer_status?: string | null;
}

export interface AuthResult {
  accessToken?: string;
  user?: StaffProfile;
}

export async function refreshSession(): Promise<AuthResult> {
  const res = await api.post("/auth/refresh", {});
  return res.data;
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function register(email: string, password: string, name?: string): Promise<AuthResult> {
  const res = await api.post("/auth/register", { email, password, name });
  return res.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
