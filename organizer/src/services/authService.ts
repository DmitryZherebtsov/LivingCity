import api from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

export interface RegisterPayload {
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
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  organizationId: string;
}

export async function register(data: RegisterPayload) {
  try {
    const response = await api.post("/organizer-auth/register", {
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
  } catch (error) {
    throw new Error(getErrorMessage(error, "Registration failed"));
  }
}

export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const response = await api.post("/organizer-auth/login", { email, password });

    const { accessToken, refreshToken, organizationId } = response.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("organizationId", organizationId);

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Login failed"));
  }
}

export function logout(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("organizationId");
}
