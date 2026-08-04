import api from "@/lib/api";

export interface OrganizationForm {
  id?: number;
  name: string;
  website: string;
  contact_email: string;
  phone: string;
  address: string;
  city: string;
  nip_krs: string;
  logo_url: string;
}

export async function fetchOrganization(): Promise<OrganizationForm> {
  const res = await api.get("/organizer/organization");
  return res.data;
}

export async function updateOrganization(form: OrganizationForm): Promise<OrganizationForm> {
  const res = await api.patch("/organizer/organization", form);
  return res.data;
}

export async function uploadOrganizationLogo(file: File): Promise<{ logo_url: string }> {
  const fd = new FormData();
  fd.append("logo", file);

  const res = await api.post("/organizer/logo", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

export async function deleteOrganizationLogo(): Promise<void> {
  await api.delete("/organizer/logo");
}
