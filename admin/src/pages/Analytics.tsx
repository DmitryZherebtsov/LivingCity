import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  CalendarDays,
  MapPin,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "@/lib/api";

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

export default function Analytics() {
  const [monthlyData, setMonthlyData] = useState(() => lastNMonths(6).map(m => ({ month: m.label, events: m.events, attendees: m.attendees })));
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [locationData, setLocationData] = useState<{ city: string; events: number }[]>([]);
  const [metrics, setMetrics] = useState({
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
        const [eventsResp, usersResp] = await Promise.allSettled([
          api.get("/api/events"),
          api.get("/api/users"),
        ]);

        const events = (eventsResp.status === "fulfilled" && Array.isArray(eventsResp.value.data))
          ? eventsResp.value.data
          : [];

        const users = (usersResp.status === "fulfilled" && Array.isArray(usersResp.value.data))
          ? usersResp.value.data
          : [];

        const months = lastNMonths(6);
        const monthIndex = (evDate: Date) => {
          for (let i = 0; i < months.length; i++) {
            const m = months[i].date;
            if (evDate.getFullYear() === m.getFullYear() && evDate.getMonth() === m.getMonth()) return i;
          }
          return -1;
        };

        let totalAttendees = 0;
        let totalRevenue = 0;
        const catMap = new Map<string, number>();
        const locMap = new Map<string, number>();

        events.forEach((ev: any) => {
          const start = ev.start_time ? new Date(ev.start_time) : (ev.created_at ? new Date(ev.created_at) : null);
          const visitors = Number(ev.visitor_count ?? ev.attendees ?? ev.attendees_count ?? 0);
          totalAttendees += visitors;

          const price = Number(ev.price ?? ev.ticket_price ?? 0);
          if (price && visitors) totalRevenue += price * visitors;

          const category = (ev.event_type ?? ev.category ?? (ev.metadata && ev.metadata.category) ?? "Other").toString();
          catMap.set(category, (catMap.get(category) || 0) + 1);

          const city = (ev.city ?? ev.location_city ?? (ev.address && ev.address.city) ?? "Unknown").toString();
          locMap.set(city, (locMap.get(city) || 0) + 1);

          if (start) {
            const idx = monthIndex(start);
            if (idx >= 0) {
              months[idx].events += 1;
              months[idx].attendees += visitors;
            }
          }
        });

        const colors = [
          "hsl(187,85%,43%)",
          "hsl(142,72%,40%)",
          "hsl(38,92%,50%)",
          "hsl(262,83%,58%)",
          "hsl(215,15%,50%)",
        ];

        const categories = Array.from(catMap.entries()).map(([name, value], i) => ({
          name,
          value,
          color: colors[i % colors.length],
        }));

        const locations = Array.from(locMap.entries())
          .map(([city, eventsCount]) => ({ city, events: eventsCount }))
          .sort((a, b) => b.events - a.events);

        const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
        const now = Date.now();
        const newAttendees = users.filter((u: any) => {
          if (!u.created_at) return false;
          const t = new Date(u.created_at).getTime();
          return now - t <= THIRTY_DAYS;
        }).length;

        const uniqueLocations = new Set(locMap.keys()).size;

        if (!mounted) return;

        setMonthlyData(months.map(m => ({ month: m.label, events: m.events, attendees: m.attendees })));
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

    return () => { mounted = false; };
  }, []);

    return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="page-header">Analityka</h1>
        <p className="page-description">Statystyki i wskaźniki wydajności</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Łączna liczba użytkowników</p>
                <p className="text-2xl font-bold mt-1">
                  {metrics.totalUsers.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2 text-success text-sm">
                  <TrendingUp className="w-4 h-4" />
                  {/* <span>—</span> */}
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nowi użytkownicy (30 dni)</p>
                <p className="text-2xl font-bold mt-1">{metrics.newAttendees.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-success text-sm">
                  <TrendingUp className="w-4 h-4" />
                  {/* <span>—</span> */}
                </div>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <Users className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utworzone wydarzenia</p>
                <p className="text-2xl font-bold mt-1">{metrics.totalEvents.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-success text-sm">
                  <TrendingUp className="w-4 h-4" />
                  {/* <span>—</span> */}
                </div>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <CalendarDays className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktywne lokalizacje</p>
                <p className="text-2xl font-bold mt-1">{metrics.activeLocations}</p>
                <div className="flex items-center gap-1 mt-2 text-destructive text-sm">
                  <TrendingDown className="w-4 h-4" />
                  {/* <span>—</span> */}
                </div>
              </div>
              <div className="p-3 bg-accent rounded-lg">
                <MapPin className="w-6 h-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Wzrost liczby wydarzeń i uczestników</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(187,85%,43%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(187,85%,43%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAttendees" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142,72%,40%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142,72%,40%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area type="monotone" dataKey="events" stroke="hsl(187,85%,43%)" fillOpacity={1} fill="url(#colorEvents)" />
                  <Area type="monotone" dataKey="attendees" stroke="hsl(142,72%,40%)" fillOpacity={1} fill="url(#colorAttendees)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Wydarzenia według kategorii</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="text-sm font-medium ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">Wydarzenia według lokalizacji</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="city" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="events" fill="hsl(187,85%,43%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
