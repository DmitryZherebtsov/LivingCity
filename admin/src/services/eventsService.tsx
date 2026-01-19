// src/services/eventsService.ts
import { api } from "./api";

export type EventItem = {
  id: number;
  title: string;
  description?: string;
  event_type?: string;
  url?: string;
  organizer?: string;
  address?: string;
  lon?: string | number | null;
  lat?: string | number | null;
  start_time?: string | null;
  end_time?: string | null;
  capacity?: number | null;
  is_free?: boolean | null;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  visitor_count?: number | null;
};

export async function fetchEvents(): Promise<EventItem[]> {
  const { data } = await api.get<EventItem[]>("/events");
  return data;
}
