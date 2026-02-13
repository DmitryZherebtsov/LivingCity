import { useEffect, useState } from "react";
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
import { fetchEvents, Event } from "@/services/eventsService";
import { EditEventModal } from "@/components/forms/EditEventModal";
import api from "@/lib/api";

const statusStyles = {
  upcoming: "bg-accent text-accent-foreground",
  active: "bg-success/10 text-success",
  completed: "bg-muted text-muted-foreground",
};

function getStatus(event: Event): "upcoming" | "active" | "completed" {
  const now = new Date();
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);

  if (end < now) return "completed";
  if (start <= now && now <= end) return "active";
  return "upcoming";
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [editOpen, setEditOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const pageSize = 7;

  useEffect(() => {
    fetchEvents().then(setEvents);
  }, []);

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.city?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  useEffect(() => {
    const totalPages = Math.ceil(filteredEvents.length / pageSize);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [filteredEvents, currentPage]);

  const totalPages = Math.ceil(filteredEvents.length / pageSize);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć to wydarzenie?")) return;

    try {
      const res = await api.delete(`/api/events/${id}`);
      return res.data;
    } catch (error) {
      console.error(error);
      alert("Nie udało się usunąć wydarzenia");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Zarządzanie wydarzeniami</h1>
          <p className="page-description">
            Zarządzaj i organizuj swoje wydarzenia
          </p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Utwórz wydarzenie
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Szukaj wydarzeń..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filtry
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
        <Table className="[&_tr:nth-child(even)]:bg-muted/5">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium">Tytuł</TableHead>
              <TableHead className="font-medium">Organizator</TableHead>
              <TableHead className="font-medium">Typ wydarzenia</TableHead>
              <TableHead className="font-medium">Miasto</TableHead>
              <TableHead className="font-medium">Data utworzenia</TableHead>
              <TableHead className="font-medium text-right">
                Liczba odwiedzających
              </TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEvents.map((event) => {
              const status = getStatus(event);
              return (
                <TableRow key={event.id} className="cursor-pointer">
                  <TableCell className="font-medium">
                    {event.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {event.organizer}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {event.event_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {event.city ?? "Brak danych"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(event.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {event.visitor_count.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        statusStyles[
                          status as keyof typeof statusStyles
                        ]
                      }
                    >
                      {status === "upcoming"
                        ? "Nadchodzące"
                        : status === "active"
                        ? "Aktywne"
                        : "Zakończone"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Zobacz szczegóły
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedEventId(event.id);
                            setEditOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edytuj
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleDelete(event.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Usuń
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Wyświetlanie {(currentPage - 1) * pageSize + 1} –{" "}
          {Math.min(currentPage * pageSize, filteredEvents.length)} z{" "}
          {filteredEvents.length} wydarzeń
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentPage <= 1}
          >
            Poprzednia
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentPage >= totalPages}
          >
            Następna
          </Button>
        </div>
      </div>

      <EditEventModal
        open={editOpen}
        eventId={selectedEventId}
        onClose={() => setEditOpen(false)}
        onUpdated={() => fetchEvents().then(setEvents)}
      />
    </div>
  );
}
