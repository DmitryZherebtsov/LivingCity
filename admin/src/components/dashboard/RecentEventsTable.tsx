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

const recentEvents = [
  {
    id: 1,
    name: "Tech Conference 2024",
    location: "San Francisco, CA",
    date: "Mar 15, 2024",
    attendees: 1250,
    status: "upcoming",
  },
  {
    id: 2,
    name: "Music Festival",
    location: "Austin, TX",
    date: "Mar 20, 2024",
    attendees: 5000,
    status: "active",
  },
  {
    id: 3,
    name: "Food & Wine Expo",
    location: "New York, NY",
    date: "Mar 25, 2024",
    attendees: 800,
    status: "upcoming",
  },
  {
    id: 4,
    name: "Art Gallery Opening",
    location: "Los Angeles, CA",
    date: "Mar 10, 2024",
    attendees: 320,
    status: "completed",
  },
  {
    id: 5,
    name: "Startup Pitch Night",
    location: "Seattle, WA",
    date: "Mar 28, 2024",
    attendees: 150,
    status: "upcoming",
  },
];

const statusStyles = {
  upcoming: "bg-accent text-accent-foreground",
  active: "bg-success/10 text-success",
  completed: "bg-muted text-muted-foreground",
};

export function RecentEventsTable() {
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentEvents.map((event) => (
            <TableRow key={event.id} className="cursor-pointer">
              <TableCell className="font-medium">{event.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {event.location}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {event.date}
                </div>
              </TableCell>
              <TableCell className="text-right">{event.attendees.toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={statusStyles[event.status as keyof typeof statusStyles]}>
                  {event.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
