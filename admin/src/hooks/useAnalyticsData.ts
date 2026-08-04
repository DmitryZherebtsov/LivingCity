import { useEffect, useState } from "react";
import { fetchEvents, Event } from "@/services/eventsService";
import { fetchUsers } from "@/services/usersService";

export interface MonthlyDataPoint {
  month: string;
  events: number;
  attendees: number;
}

export interface CategoryDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface LocationDataPoint {
  city: string;
  events: number;
}

export interface AnalyticsMetrics {
  totalUsers: number;
  newAttendees: number;
  totalEvents: number;
  activeLocations: number;
}

function monthLabel(date: Date) {
  return date.toLocaleString(undefined, { month: "short" });
}

function lastNMonths(n = 6) {
  const res: { label: string; date: Date; events: number; attendees: number }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    res.push({ label: monthLabel(d), date: d, events: 0, attendees: 0 });
  }
  return res;
}

const CHART_COLORS = [
  "hsl(187,85%,43%)",
  "hsl(142,72%,40%)",
  "hsl(38,92%,50%)",
  "hsl(262,83%,58%)",
  "hsl(215,15%,50%)",
];

export function useAnalyticsData() {
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>(() =>
    lastNMonths(6).map((m) => ({ month: m.label, events: m.events, attendees: m.attendees }))
  );
  const [categoryData, setCategoryData] = useState<CategoryDataPoint[]>([]);
  const [locationData, setLocationData] = useState<LocationDataPoint[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalUsers: 0,
    newAttendees: 0,
    totalEvents: 0,
    activeLocations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [eventsResp, usersResp] = await Promise.allSettled([fetchEvents(), fetchUsers()]);

        const events: Event[] = eventsResp.status === "fulfilled" && Array.isArray(eventsResp.value) ? eventsResp.value : [];
        const users = usersResp.status === "fulfilled" && Array.isArray(usersResp.value) ? usersResp.value : [];

        const months = lastNMonths(6);
        const monthIndex = (evDate: Date) => {
          for (let i = 0; i < months.length; i++) {
            const m = months[i].date;
            if (evDate.getFullYear() === m.getFullYear() && evDate.getMonth() === m.getMonth()) return i;
          }
          return -1;
        };

        const catMap = new Map<string, number>();
        const locMap = new Map<string, number>();

        events.forEach((ev) => {
          const start = ev.start_time ? new Date(ev.start_time) : ev.created_at ? new Date(ev.created_at) : null;
          const visitors = Number(ev.visitor_count ?? 0);

          const category = (ev.event_type ?? "Other").toString();
          catMap.set(category, (catMap.get(category) || 0) + 1);

          const city = (ev.city ?? "Unknown").toString();
          locMap.set(city, (locMap.get(city) || 0) + 1);

          if (start) {
            const idx = monthIndex(start);
            if (idx >= 0) {
              months[idx].events += 1;
              months[idx].attendees += visitors;
            }
          }
        });

        const categories = Array.from(catMap.entries()).map(([name, value], i) => ({
          name,
          value,
          color: CHART_COLORS[i % CHART_COLORS.length],
        }));

        const locations = Array.from(locMap.entries())
          .map(([city, eventsCount]) => ({ city, events: eventsCount }))
          .sort((a, b) => b.events - a.events);

        const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
        const now = Date.now();
        const newAttendees = users.filter((u) => {
          if (!u.created_at) return false;
          const t = new Date(u.created_at).getTime();
          return now - t <= THIRTY_DAYS;
        }).length;

        const uniqueLocations = new Set(locMap.keys()).size;

        if (!mounted) return;

        setMonthlyData(months.map((m) => ({ month: m.label, events: m.events, attendees: m.attendees })));
        setCategoryData(categories);
        setLocationData(locations.slice(0, 10));
        setMetrics({
          totalUsers: users.length,
          newAttendees,
          totalEvents: events.length,
          activeLocations: uniqueLocations,
        });
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { monthlyData, categoryData, locationData, metrics, loading };
}
