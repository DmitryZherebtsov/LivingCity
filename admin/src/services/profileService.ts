import api from "@/lib/api";

export interface MyProfile {
  [key: string]: unknown;
  id: string;
  name?: string;
  email: string;
}

export async function fetchMyProfile(): Promise<MyProfile> {
  const res = await api.get("/api/users/me");
  return res.data;
}

export async function updateMyProfile(formData: FormData): Promise<MyProfile> {
  const res = await api.patch("/api/users/me", formData);
  return res.data;
}

export async function deleteMyAccount(password: string): Promise<void> {
  await api.delete("/api/users/me", { data: { password, hard: true } });
}
