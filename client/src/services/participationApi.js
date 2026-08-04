import api from "../api/axios";

export async function checkParticipation(eventId) {
  const res = await api.get(`/api/participation/${eventId}/check`);
  return !!res.data?.going;
}

export async function joinEvent(eventId) {
  await api.post(`/api/participation/${eventId}`);
}

export async function leaveEvent(eventId) {
  await api.delete(`/api/participation/${eventId}`);
}
