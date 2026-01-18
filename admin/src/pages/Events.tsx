import { useState } from "react";
import { Plus, Filter, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const events = [
  { id: 1, name: "Tech Conference 2024", location: "San Francisco, CA", date: "Mar 15, 2024", attendees: 1250, status: "upcoming", category: "Technology" },
  { id: 2, name: "Music Festival", location: "Austin, TX", date: "Mar 20, 2024", attendees: 5000, status: "active", category: "Entertainment" },
  { id: 3, name: "Food & Wine Expo", location: "New York, NY", date: "Mar 25, 2024", attendees: 800, status: "upcoming", category: "Food & Drink" },
  { id: 4, name: "Art Gallery Opening", location: "Los Angeles, CA", date: "Mar 10, 2024", attendees: 320, status: "completed", category: "Arts" },
  { id: 5, name: "Startup Pitch Night", location: "Seattle, WA", date: "Mar 28, 2024", attendees: 150, status: "upcoming", category: "Business" },
  { id: 6, name: "Marathon 2024", location: "Boston, MA", date: "Apr 5, 2024", attendees: 8500, status: "upcoming", category: "Sports" },
  { id: 7, name: "Book Fair", location: "Chicago, IL", date: "Apr 10, 2024", attendees: 600, status: "upcoming", category: "Education" },
  { id: 8, name: "Jazz Concert", location: "New Orleans, LA", date: "Mar 8, 2024", attendees: 450, status: "completed", category: "Entertainment" },
];

const statusStyles = {
  upcoming: "bg-accent text-accent-foreground",
  active: "bg-success/10 text-success",
  completed: "bg-muted text-muted-foreground",
};

export default function Events() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Events</h1>
          <p className="page-description">Manage and organize your events</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Events Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium">Event Name</TableHead>
              <TableHead className="font-medium">Category</TableHead>
              <TableHead className="font-medium">Location</TableHead>
              <TableHead className="font-medium">Date</TableHead>
              <TableHead className="font-medium text-right">Attendees</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.map((event) => (
              <TableRow key={event.id} className="cursor-pointer">
                <TableCell className="font-medium">{event.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{event.category}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{event.location}</TableCell>
                <TableCell className="text-muted-foreground">{event.date}</TableCell>
                <TableCell className="text-right">{event.attendees.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusStyles[event.status as keyof typeof statusStyles]}>
                    {event.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {filteredEvents.length} of {events.length} events</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}
