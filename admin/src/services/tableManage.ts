export async function fetchEventById(id: number) {
  const res = await fetch(`http://localhost:3000/api/events/${id}`);
  if (!res.ok) throw new Error("Failed to fetch event");
  return res.json();
}

export async function updateEvent(id: number, data: any) {
  const res = await fetch(`http://localhost:3000/api/events/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
}
