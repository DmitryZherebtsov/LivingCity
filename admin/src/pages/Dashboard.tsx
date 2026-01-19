import { useState, useEffect, useMemo } from "react";
import { CalendarDays, Users, MapPin, TrendingUp, Plus, Filter, Download } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentEventsTable } from "@/components/dashboard/RecentEventsTable";
import { MapPreview } from "@/components/dashboard/MapPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchEvents, calculateStats } from '@/services/eventsService';
import type { Event, Stats } from '@/services/eventsService'; // Імпорт типів

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalEvents: "0",
    totalEventsChange: "0%",
    activeLocations: "0",
    upcomingEvents: "0",
    totalAttendees: "0K",
    totalAttendeesChange: "0%",
    growthRate: "0%",
    growthRateChange: "0%",
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const filteredEvents = useMemo(() => {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return events;

  const isNumeric = /^\d+$/.test(query);
  const idQuery = Number(query);

  return events.filter((event) => {
    if (isNumeric) {
      return event.id === idQuery;
    }

    return [
      event.title,
      event.address,
      event.organizer,
      event.event_type,
      event.description,
    ].some((field) =>
      field?.toLowerCase().includes(query)
    );
  });
}, [events, searchQuery]);



  useEffect(() => {
    const loadData = async () => {
      const fetchedEvents = await fetchEvents();
      const calculatedStats = calculateStats(fetchedEvents);
      setEvents(fetchedEvents);
      setStats(calculatedStats);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Dashboard</h1>
          <p className="page-description">Overview of your event management</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      {/* Search and  Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search events, locations..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          change={stats.totalEventsChange}
          changeType="positive"
          icon={CalendarDays}
          gradient={1}
        />
        <StatCard
          title="Active Locations"
          value={stats.activeLocations}
          change={`Upcoming ${stats.upcomingEvents}`}
          changeType="positive"
          icon={MapPin}
          gradient={2}
        />
        <StatCard
          title="Total Attendees"
          value={stats.totalAttendees}
          change={stats.totalAttendeesChange}
          changeType="positive"
          icon={Users}
          gradient={3}
        />
        <StatCard
          title="Growth Rate"
          value={stats.growthRate}
          change={stats.growthRateChange}
          changeType="positive"
          icon={TrendingUp}
          gradient={4}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentEventsTable events={filteredEvents} />
        </div>
        <div>
          <MapPreview events={events} />
        </div>
      </div>
    </div>
  );
}
