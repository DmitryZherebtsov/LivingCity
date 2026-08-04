import api from "../api/axios";

export async function updateMyProfile(formData) {
  const res = await api.patch("/api/users/me", formData);
  return res.data;
}

export async function deleteMyAccount(password) {
  await api.delete("/api/users/me", { data: { password, hard: true } });
}
