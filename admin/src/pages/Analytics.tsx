import { TrendingUp, TrendingDown, Users, CalendarDays, MapPin, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const monthlyData = [
  { month: "Jan", events: 45, attendees: 3200 },
  { month: "Feb", events: 52, attendees: 4100 },
  { month: "Mar", events: 61, attendees: 5800 },
  { month: "Apr", events: 78, attendees: 7200 },
  { month: "May", events: 95, attendees: 8500 },
  { month: "Jun", events: 110, attendees: 9800 },
];

const categoryData = [
  { name: "Technology", value: 35, color: "hsl(187, 85%, 43%)" },
  { name: "Entertainment", value: 25, color: "hsl(142, 72%, 40%)" },
  { name: "Business", value: 20, color: "hsl(38, 92%, 50%)" },
  { name: "Sports", value: 12, color: "hsl(262, 83%, 58%)" },
  { name: "Other", value: 8, color: "hsl(215, 15%, 50%)" },
];

const locationData = [
  { city: "San Francisco", events: 145 },
  { city: "New York", events: 132 },
  { city: "Austin", events: 98 },
  { city: "Los Angeles", events: 87 },
  { city: "Seattle", events: 76 },
  { city: "Chicago", events: 65 },
];

export default function Analytics() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-header">Analytics</h1>
        <p className="page-description">Insights and performance metrics</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">$128,540</p>
                <div className="flex items-center gap-1 mt-2 text-success text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+18.2%</span>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Attendees</p>
                <p className="text-2xl font-bold mt-1">2,847</p>
                <div className="flex items-center gap-1 mt-2 text-success text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12.5%</span>
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
                <p className="text-sm text-muted-foreground">Events Created</p>
                <p className="text-2xl font-bold mt-1">156</p>
                <div className="flex items-center gap-1 mt-2 text-success text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+8.3%</span>
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
                <p className="text-sm text-muted-foreground">Active Locations</p>
                <p className="text-2xl font-bold mt-1">48</p>
                <div className="flex items-center gap-1 mt-2 text-destructive text-sm">
                  <TrendingDown className="w-4 h-4" />
                  <span>-2.1%</span>
                </div>
              </div>
              <div className="p-3 bg-accent rounded-lg">
                <MapPin className="w-6 h-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Events & Attendees Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(187, 85%, 43%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(187, 85%, 43%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAttendees" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 72%, 40%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(142, 72%, 40%)" stopOpacity={0}/>
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
                  <Area type="monotone" dataKey="events" stroke="hsl(187, 85%, 43%)" fillOpacity={1} fill="url(#colorEvents)" />
                  <Area type="monotone" dataKey="attendees" stroke="hsl(142, 72%, 40%)" fillOpacity={1} fill="url(#colorAttendees)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Events by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
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
                    <span className="text-sm font-medium ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">Events by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="city" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="events" fill="hsl(187, 85%, 43%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
