import { useState, useEffect, useMemo } from "react";
import {
  CalendarDays,
  MapPin,
  Users,
  TrendingUp,
  Plus,
  Clock,
} from "lucide-react";
import api from "@/lib/api";
import { useOrganizerAuth } from "@/context/OrganizerAuthContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Event {
  id: number;
  title: string;
  address: string;
  city: string;
  start_time: string;
  capacity: number;
  visitor_count: number;
  status: "pending" | "approved" | "rejected";
}

function OrganizerDashboard() {
  const { user, isLoading } = useOrganizerAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    const load = async () => {
      const res = await api.get("/events/my");
      setEvents(res.data);
      setLoading(false);
    };

    load();
  }, [isLoading]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return events;

    return events.filter((e) =>
      [e.title, e.address, e.city].some((f) => f?.toLowerCase().includes(q)),
    );
  }, [search, events]);

  const totalEvents = events.length;
  const approved = events.filter((e) => e.status === "approved").length;
  const pending = events.filter((e) => e.status === "pending").length;
  const totalVisitors = events.reduce(
    (sum, e) => sum + (e.visitor_count || 0),
    0,
  );

  if (loading) return <div>Ładowanie...</div>;

  return (
    <div className="w-full px-6 lg:px-10 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Panel Organizatora
            </h1>
            <p className="text-muted-foreground">
              Zarządzaj swoimi wydarzeniami
            </p>
          </div>

          <Button
            className="bg-orange-500 hover:bg-orange-600 shadow-md"
            onClick={() => navigate("/events/create")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nowe wydarzenie
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Moje wydarzenia"
            value={String(totalEvents)}
            change="Łącznie"
            changeType="positive"
            icon={CalendarDays}
            gradient={1}
          />
          <StatCard
            title="Zatwierdzone"
            value={String(approved)}
            change="Widoczne na mapie"
            changeType="positive"
            icon={TrendingUp}
            gradient={2}
          />
          <StatCard
            title="Oczekujące"
            value={String(pending)}
            change="Czekają na moderację"
            changeType="neutral"
            icon={Clock}
            gradient={3}
          />
          <StatCard
            title="Uczestnicy"
            value={String(totalVisitors)}
            change="Łączna liczba"
            changeType="positive"
            icon={Users}
            gradient={4}
          />
        </div>

        <div className="max-w-md">
          <Input
            placeholder="Szukaj wydarzeń..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="shadow-sm"
          />
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              Brak wydarzeń
            </div>
          ) : (
            filtered.map((event) => (
              <div key={event.id}
                className="group relative p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/40 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex justify-between items-center">
                <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl
                ${ event.status === "approved"
                    ? "bg-emerald-500"
                    : event.status === "pending"
                    ? "bg-yellow-500"
                    : "bg-rose-500"}
              `}/>

                <div>
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {event.address}, {event.city}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.start_time).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Badge
                    className={
                      event.status === "approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : event.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-rose-100 text-rose-700"
                    }
                  >
                    {event.status}
                  </Badge>

                  <Button
                    size="sm"
                    variant="outline"
                    className="shadow-sm"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    Szczegóły
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default OrganizerDashboard;
