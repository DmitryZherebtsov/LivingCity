import api from "@/lib/api";

export type OrganizationStatus = "pending" | "approved" | "rejected";

export interface Organization {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  website?: string | null;
  contact_email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  logo_url?: string | null;
  nip_krs?: string | null;
  metadata?: Record<string, unknown>;
  status: OrganizationStatus | string;
  created_at: string;
  updated_at?: string | null;
}

export async function fetchOrganizations(status: OrganizationStatus): Promise<Organization[]> {
  const res = await api.get(`/api/admin/organizations?status=${status}`);
  return res.data || [];
}

export async function updateOrganizationStatus(
  id: number,
  status: "approved" | "rejected",
  reason?: string | null
): Promise<void> {
  await api.patch(`/api/admin/organizations/${id}/status`, { status, reason });
}
