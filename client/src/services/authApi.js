import api from "../api/axios";

export async function login({ email, password }) {
  const res = await api.post("/api/public-auth/login", { email, password });
  return res.data;
}

export async function register(formData) {
  const res = await api.post("/api/public-auth/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function logout() {
  await api.post("/api/public-auth/logout");
}

export async function fetchCurrentUser() {
  const res = await api.get("/api/users/me");
  return res.data;
}
