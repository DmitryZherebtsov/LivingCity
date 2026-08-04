import {
  TrendingUp,
  TrendingDown,
  Users,
  CalendarDays,
  MapPin,
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
import { useAnalyticsData } from "@/hooks/useAnalyticsData";

export default function Analytics() {
  const { monthlyData, categoryData, locationData, metrics } = useAnalyticsData();

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
