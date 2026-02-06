import { apiClient } from "./apiClient";


export function fetchEvents() {
  return apiClient('/api/events');
}
