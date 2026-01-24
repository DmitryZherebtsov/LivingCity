import axios from 'axios';
import api from "@/lib/api";

export interface Event {
  id: number;
  title: string;
  description: string;
  event_type: string;
  url: string;
  organizer: string;
  address: string;
  lon: string;
  lat: string;
  start_time: string;
  end_time: string;
  capacity: number | null;
  is_free: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  visitor_count: number;
  city: string | null;
}

export interface Stats {
  totalEvents: string;
  totalEventsChange: string;    
  activeLocations: string;
  upcomingEvents: string;       
  totalAttendees: string;
  totalAttendeesChange: string; 
  growthRate: string;
  growthRateChange: string;   
}

export const fetchEvents = async (): Promise<Event[]> => {
  try {
    const res = await api.get<Event[]>("/api/events");
    return res.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

export async function deleteEvent(id: number) {
  await api.delete(`/events/${id}`);
}

const safePercentChange = (current: number, previous: number): string => {
  if (previous === 0) {
    if (current === 0) return '0%';
    return `+${current - previous}`;
  }
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
};

export const calculateStats = (events: Event[]): Stats => {
  if (!events || events.length === 0) {
    return {
      totalEvents: '0',
      totalEventsChange: '0%',
      activeLocations: '0',
      upcomingEvents: '0',
      totalAttendees: '0K',
      totalAttendeesChange: '0%',
      growthRate: '0%',
      growthRateChange: '0%',
    };
  }

  const now = new Date();
  const totalEvents = events.length;

  const activeEvents = events.filter((event) => {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    return start <= now && now <= end;
  });

  const activeLocationsCount = new Set(
    activeEvents
      .filter(e => e.lat && e.lon)
      .map(e => `${Number(e.lat).toFixed(5)},${Number(e.lon).toFixed(5)}`)
  ).size;

  // ---------- Upcoming events
  const upcomingCount = events.filter(e => new Date(e.start_time) > now).length;

  // ---------- Total attendees (всі)
  const totalAttendees = events.reduce((sum, e) => sum + (e.visitor_count || 0), 0);

  // ---------- Порівняння за періодами (30 днів windows)
  const MS_DAY = 24 * 60 * 60 * 1000;
  const windowDays = 30;
  const thisWindowStart = new Date(now.getTime() - windowDays * MS_DAY);
  const prevWindowStart = new Date(now.getTime() - 2 * windowDays * MS_DAY);
  const prevWindowEnd = thisWindowStart;

  const isInThisWindow = (dStr: string) => new Date(dStr) > thisWindowStart;
  const isInPrevWindow = (dStr: string) => {
    const d = new Date(dStr);
    return d > prevWindowStart && d <= prevWindowEnd;
  };

  const thisWindowEventCount = events.filter(e => isInThisWindow(e.created_at)).length;
  const prevWindowEventCount = events.filter(e => isInPrevWindow(e.created_at)).length;

  const thisWindowAttendees = events
    .filter(e => isInThisWindow(e.created_at))
    .reduce((s, e) => s + (e.visitor_count || 0), 0);

  const prevWindowAttendees = events
    .filter(e => isInPrevWindow(e.created_at))
    .reduce((s, e) => s + (e.visitor_count || 0), 0);

  const totalEventsChangeStr = safePercentChange(thisWindowEventCount, prevWindowEventCount) + ' from last month';
  const totalAttendeesChangeStr = safePercentChange(thisWindowAttendees, prevWindowAttendees) + ' from last month';

  const recentEventsCount = thisWindowEventCount; // created in last 30d
  const growthRate = ((recentEventsCount / totalEvents) * 100).toFixed(1) + '%';

  const weekMs = 7 * MS_DAY;
  const thisWeekStart = new Date(now.getTime() - weekMs);
  const prevWeekStart = new Date(now.getTime() - 2 * weekMs);
  const prevWeekEnd = thisWeekStart;

  const eventsThisWeek = events.filter(e => new Date(e.created_at) > thisWeekStart).length;
  const eventsPrevWeek = events.filter(e => {
    const d = new Date(e.created_at);
    return d > prevWeekStart && d <= prevWeekEnd;
  }).length;

  const growthThisWeekPct = totalEvents === 0 ? 0 : (eventsThisWeek / totalEvents) * 100;
  const growthPrevWeekPct = totalEvents === 0 ? 0 : (eventsPrevWeek / totalEvents) * 100;

  let growthRateChangeStr: string;
  if (growthPrevWeekPct === 0) {
    if (growthThisWeekPct === 0) growthRateChangeStr = '0% from last week';
    else growthRateChangeStr = `+${eventsThisWeek - eventsPrevWeek} from last week`;
  } else {
    const pctChange = ((growthThisWeekPct - growthPrevWeekPct) / Math.abs(growthPrevWeekPct)) * 100;
    const sign = pctChange >= 0 ? '+' : '';
    growthRateChangeStr = `${sign}${pctChange.toFixed(1)}% from last week`;
  }

  return {
    totalEvents: totalEvents.toLocaleString(),
    totalEventsChange: totalEventsChangeStr,
    activeLocations: activeLocationsCount.toLocaleString(),
    upcomingEvents: upcomingCount.toLocaleString(),
    totalAttendees: (totalAttendees / 1000).toFixed(1) + 'K',
    totalAttendeesChange: totalAttendeesChangeStr,
    growthRate,
    growthRateChange: growthRateChangeStr,
  };
};
