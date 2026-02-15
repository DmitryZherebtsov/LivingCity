import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react";

interface EventType {
  id: number;
  title: string;
  location: string;
  date: string;
  status: "active" | "completed" | "cancelled";
}

const Dashboard = () => {
  const [events] = useState<EventType[]>([]);

  const active = events.filter((e) => e.status === "active").length;
  const completed = events.filter((e) => e.status === "completed").length;
  const cancelled = events.filter((e) => e.status === "cancelled").length;

  const stats = [
    { label: "Total Events", value: events.length, icon: BarChart3 },
    { label: "Active", value: active, icon: CalendarDays },
    { label: "Completed", value: completed, icon: CheckCircle },
    { label: "Cancelled", value: cancelled, icon: XCircle },
  ];

  const statusColor: Record<string, string> = {
    active: "bg-primary text-primary-foreground",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
              <s.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event History</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No events yet. Create your first event!
            </p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.location} ·{" "}
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>

                  <Badge className={statusColor[event.status]}>
                    {event.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
