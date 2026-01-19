import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar } from "lucide-react";

export type ApiEvent = {
  id: number;
  title: string;
  description?: string;
  event_type?: string;
  url?: string;
  organizer?: string;
  address?: string;
  lon?: string;
  lat?: string;
  start_time?: string | null; // ISO
  end_time?: string | null;   // ISO
  capacity?: number | null;
  is_free?: boolean;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  visitor_count?: number | null;
};

type Props = {
  events?: ApiEvent[] | null;
};

const statusStyles = {
  upcoming: "bg-accent text-accent-foreground",
  active: "bg-success/10 text-success",
  completed: "bg-muted text-muted-foreground",
} as const;

function getStatus(startISO?: string | null, endISO?: string | null) {
  const now = new Date();
  const start = startISO ? new Date(startISO) : null;
  const end = endISO ? new Date(endISO) : null;

  if (start && now < start) return "upcoming";
  if (start && end && now >= start && now <= end) return "active";
  if (end && now > end) return "completed";

  if (start && !end) {
    return now >= start ? "active" : "upcoming";
  }
  return "upcoming";
}

function formatDateRange(startISO?: string | null, endISO?: string | null) {
  if (!startISO && !endISO) return "—";

  const tz = "Europe/Warsaw";

  const dateOpts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: tz,
  };

  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  };

  const start = startISO ? new Date(startISO) : null;
  const end = endISO ? new Date(endISO) : null;

  if (start && end) {
    const sameDay =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate();

    if (sameDay) {
      const date = new Intl.DateTimeFormat("pl-PL", dateOpts).format(start);
      const from = new Intl.DateTimeFormat("pl-PL", timeOpts).format(start);
      const to = new Intl.DateTimeFormat("pl-PL", timeOpts).format(end);
      return `${date}, ${from} - ${to}`;
    }

    const startStr = new Intl.DateTimeFormat("pl-PL", {
      ...dateOpts,
      ...timeOpts,
    }).format(start);

    const endStr = new Intl.DateTimeFormat("pl-PL", {
      ...dateOpts,
      ...timeOpts,
    }).format(end);

    return `${startStr} - ${endStr}`;
  }

  if (start) {
    return new Intl.DateTimeFormat("pl-PL", {
      ...dateOpts,
      ...timeOpts,
    }).format(start);
  }

  if (end) {
    return new Intl.DateTimeFormat("pl-PL", {
      ...dateOpts,
      ...timeOpts,
    }).format(end);
  }

  return "—";
}


export function RecentEventsTable({ events }: Props) {
  const list = events ?? [];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-semibold text-card-foreground">Recent Events</h3>
        <p className="text-sm text-muted-foreground">Latest event activities</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-medium">Event</TableHead>
            <TableHead className="font-medium">Location</TableHead>
            <TableHead className="font-medium">Date</TableHead>
            <TableHead className="font-medium text-right">Attendees</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Type</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {list.map((event) => {
            const status = getStatus(event.start_time, event.end_time) as
              | "upcoming"
              | "active"
              | "completed";
            const attendees =
              event.visitor_count ?? event.capacity ?? null; // fallback
            return (
              <TableRow key={event.id} className="cursor-pointer">
                <TableCell className="font-medium">{event.title}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.address ?? "—"}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateRange(event.start_time, event.end_time)}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  {attendees !== null ? attendees.toLocaleString() : "—"}
                </TableCell>

                <TableCell>
                  <Badge
                    variant="secondary"
                    className={statusStyles[status as keyof typeof statusStyles]}
                  >
                    {status}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge>
                    {event.event_type}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default RecentEventsTable;
