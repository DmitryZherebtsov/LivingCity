import { useEffect, useMemo, useState } from "react";
import { fetchEvents, Event } from "@/services/eventsService";

export type DashboardStats = {
  totalEvents: number;
  activeLocations: number;
  totalAttendees: number;
  growthRate: number;
};

export function useEventsData() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchEvents();
        if (!cancelled) setEvents(data);
      } catch (err: any) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to load events"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo<DashboardStats>(() => {
    // Total events
    const totalEvents = events.length;

    // Active locations (unique lon+lat)
    const locationsSet = new Set(
      events
        .filter((e) => e.lon && e.lat)
        .map((e) => `${e.lon},${e.lat}`)
    );

    // Total attendees (visitor_count або capacity fallback)
    const totalAttendees = events.reduce((sum, e) => {
      if (typeof e.visitor_count === "number") {
        return sum + e.visitor_count;
      }
      if (typeof e.capacity === "number") {
        return sum + e.capacity;
      }
      return sum;
    }, 0);

    // Growth rate (заглушка, під аналітику з бекенду)
    const growthRate = totalEvents > 0 ? 12.5 : 0;

    return {
      totalEvents,
      activeLocations: locationsSet.size,
      totalAttendees,
      growthRate,
    };
  }, [events]);

  return {
    events,
    stats,
    loading,
    error,
  };
}
