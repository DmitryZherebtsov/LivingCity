import api from "../api/axios";

export async function fetchEvents() {
  const res = await api.get("/api/events");
  return res.data;
}

export async function fetchEventTypes() {
  const res = await api.get("/api/events/event-types");
  return res.data;
}
