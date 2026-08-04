import api from "@/lib/api";

export interface Event {
  id: number;
  title: string;
  description: string;
  event_type: string;
  url: string;
  organizer: string;
  address: string;
  city: string;
  lon: string;
  lat: string;
  start_time: string;
  end_time: string;
  capacity: number | null;
  is_free: boolean;
  metadata: Record<string, unknown>;
  status: "pending" | "approved" | "rejected";
  visitor_count: number;
}

export interface EventImage {
  id: number | string;
  filename: string;
  position?: number;
}

export type EventFormPayload = {
  title: string;
  description: string;
  event_type: string;
  url?: string | null;
  organizer?: string | null;
  address?: string | null;
  city?: string | null;
  lon: number | null;
  lat: number | null;
  start_time: string;
  end_time: string;
  capacity: number | null;
  is_free: boolean;
  metadata: Record<string, unknown>;
  status?: string;
};

export async function fetchMyEvents(): Promise<Event[]> {
  const res = await api.get("/events/my");
  return res.data;
}

export async function fetchEventById(id: string | number): Promise<Event & { images?: EventImage[] }> {
  const res = await api.get(`/events/${id}`);
  return res.data;
}

export async function createEvent(payload: EventFormPayload): Promise<Event> {
  const res = await api.post("/events", payload);
  return res.data;
}

export async function updateEvent(id: string | number, payload: Partial<EventFormPayload>): Promise<Event> {
  const res = await api.patch(`/events/${id}`, payload);
  return res.data;
}

export async function deleteEvent(id: string | number): Promise<void> {
  await api.delete(`/events/${id}`);
}

export async function uploadEventImages(
  id: string | number,
  files: File[],
  options: { originalFirst?: boolean } = {}
): Promise<EventImage[]> {
  const fd = new FormData();
  files.forEach((f) => fd.append("images", f));

  const query = options.originalFirst ? "?original_first=true" : "";
  const res = await api.post(`/events/${id}/images${query}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.images ?? res.data ?? [];
}

export async function deleteEventImage(imageId: string | number): Promise<void> {
  await api.delete(`/events/images/${imageId}`);
}
