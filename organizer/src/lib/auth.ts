import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api/organizer-auth",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function register(data: {
  orgName: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  logoUrl?: string;
  fullName: string;
  password: string;
  nipKrs?: string;
}) {
  try {
    const response = await API.post("/register", {
      email: data.email,
      password: data.password,
      name: data.fullName,

      orgName: data.orgName,
      description: data.description,
      website: data.website,
      contactEmail: data.contactEmail,
      phone: data.phone,
      address: data.address,
      city: data.city,
      logoUrl: data.logoUrl,
      nipKrs: data.nipKrs,
    });

    return response.data;

  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Registration failed"
    );
  }
}

export async function login(email: string, password: string) {
  try {
    const response = await API.post("/login", {
      email,
      password,
    });

    const { accessToken, refreshToken, organizationId } = response.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("organizationId", organizationId);

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Login failed"
    );
  }
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("organizationId");
}
