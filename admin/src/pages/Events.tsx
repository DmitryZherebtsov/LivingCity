import { useEffect, useState } from "react";
import { Plus, Filter, Search, MoreHorizontal, Edit, Trash2, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table,TableBody, TableCell, TableHead, TableHeader,TableRow} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchEvents, Event } from "@/services/eventsService";
import { EditEventModal } from "@/components/forms/EditEventModal";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

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

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [editOpen, setEditOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const [sideOpen, setSideOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [sideLoading, setSideLoading] = useState(false);

  const pageSize = 7;

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const list = await fetchEvents();
      setEvents(list || []);
    } catch (err: any) {
      console.error("fetch events", err);
      toast({ title: "Błąd", description: "Nie można pobrać wydarzeń", variant: "destructive" });
    }
  };

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
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć to wydarzenie?")) return;
    try {
      await api.delete(`/api/events/${id}`);
      toast({ title: "Usunięto" });
      setEvents((s) => s.filter((e) => e.id !== id));
      if (selectedEvent?.id === id) { setSelectedEvent(null); setSideOpen(false); }
    } catch (error) {
      console.error(error);
      toast({ title: "Błąd", description: "Nie udało się usunąć wydarzenia", variant: "destructive" });
    }
  };

  const openSideWith = async (id: number) => {
    setSideLoading(true);
    setSideOpen(true);
    setSelectedEvent(null);
    try {
      const res = await api.get(`/api/events/${id}`);
      const data = res.data;
      if (Array.isArray(data.images)) {
        data.images = data.images.map((img: any) => ({
          ...img,
          url: img.url ? img.url : `/uploads/events/${data.id}/${img.filename}`,
        }));
      }
      if (data.first_image) {
        data.first_image = {
          ...data.first_image,
          url: data.first_image.url ? data.first_image.url : `/uploads/events/${data.id}/${data.first_image.filename}`,
        };
      }
      setSelectedEvent(data);
    } catch (err: any) {
      console.error("load event", err);
      toast({ title: "Błąd", description: "Nie można pobrać szczegółów", variant: "destructive" });
      setSideOpen(false);
    } finally {
      setSideLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Powód odrzucenia (opcjonalnie):", "");
    if (reason === null) return; 
    try {
      await api.patch(`/api/events/reject/${id}`, { reason });
      toast({ title: "Odrzucono wydarzenie" });
      setEvents((s) => s.filter((e) => e.id !== id));
      setSelectedEvent(null);
      setSideOpen(false);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Błąd", description: err.response?.data?.error || "Operacja nie powiodła się", variant: "destructive" });
    }
  };


  return (
    <>
      <div className="p-6 lg:p-8 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-header">Zarządzanie wydarzeniami</h1>
            <p className="page-description">Zarządzaj i organizuj swoje wydarzenia</p>
          </div>
          {/* <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Utwórz wydarzenie
          </Button> */}
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
                <TableHead className="font-medium text-right">Liczba odwiedzających</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEvents.map((event) => {
                const status = getStatus(event);
                return (
                  <TableRow key={event.id} className="cursor-pointer hover:bg-muted/20" onClick={() => openSideWith(event.id)}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell className="text-muted-foreground">{event.organizer}</TableCell>
                    <TableCell><Badge variant="outline">{event.event_type}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{event.city ?? "Brak danych"}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(event.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{(event.visitor_count ?? 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusStyles[status]}>
                        {status === "upcoming" ? "Nadchodzące" : status === "active" ? "Aktywne" : "Zakończone"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openSideWith(event.id)}><Eye className="w-4 h-4 mr-2" />Zobacz szczegóły</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedEventId(event.id); setEditOpen(true); }}><Edit className="w-4 h-4 mr-2" />Edytuj</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(event.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Usuń</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
            {Math.min(currentPage * pageSize, filteredEvents.length)} z {filteredEvents.length} wydarzeń
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentPage <= 1}>Poprzednia</Button>
            <Button variant="outline" size="sm" onClick={handleNext} disabled={currentPage >= totalPages}>Następna</Button>
          </div>
        </div>

        <EditEventModal
          open={editOpen}
          eventId={selectedEventId}
          onClose={() => setEditOpen(false)}
          onUpdated={() => loadEvents()}
        />
      </div>

      {sideOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => { setSideOpen(false); setSelectedEvent(null); }} aria-hidden />
          <aside className="fixed right-0 top-0 h-full w-full sm:w-[620px] z-50 bg-card border-l p-6 overflow-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                {selectedEvent?.first_image?.url ? (
                  <img src={`${BASE_URL}${selectedEvent.first_image.url}`} alt={selectedEvent.title} className="h-14 w-20 rounded-md object-cover" />
                ) : (
                  <div className="h-14 w-20 rounded-md bg-muted/20 flex items-center justify-center text-sm">{selectedEvent?.title?.slice(0,2).toUpperCase()}</div>
                )}
                <div>
                  <h2 className="text-lg font-semibold">{selectedEvent?.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedEvent?.city || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-800">{selectedEvent?.status || "—"}</Badge>
                <Button variant="ghost" size="sm" onClick={() => { setSideOpen(false); setSelectedEvent(null); }}><X className="w-4 h-4" /></Button>
              </div>
            </div>

            {sideLoading ? (
              <div className="py-8 text-center">Ładowanie szczegółów...</div>
            ) : selectedEvent ? (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-medium mb-2">Galeria</h3>
                  {selectedEvent.images?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedEvent.images.map((img: any) => (
                        <img key={img.id} src={`${BASE_URL}${img.url}`} className="w-full h-36 object-cover rounded-lg shadow" />
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Brak zdjęć</div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Opis</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedEvent.description || "—"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Miasto:</strong> {selectedEvent.city || "—"}</div>
                  <div><strong>Adres:</strong> {selectedEvent.address || "—"}</div>
                  <div><strong>Start:</strong> {selectedEvent.start_time ? new Date(selectedEvent.start_time).toLocaleString() : "—"}</div>
                  <div><strong>Koniec:</strong> {selectedEvent.end_time ? new Date(selectedEvent.end_time).toLocaleString() : "—"}</div>
                  <div><strong>Pojemność:</strong> {selectedEvent.capacity ?? "—"}</div>
                  <div><strong>Typ:</strong> {selectedEvent.event_type || "—"}</div>
                  <div><strong>Bezpłatne:</strong> {selectedEvent.is_free ? "Tak" : "Nie"}</div>
                  <div><strong>Organizator:</strong> {selectedEvent.organizer || "—"}</div>
                </div>

                <div className="flex gap-3 mt-4">

                  <Button variant="destructive" className="flex-1" onClick={() => handleReject(selectedEvent.id)}>
                    Odrzuć Wydarzenie
                  </Button>
                </div>
              </div>
            ) : null}
          </aside>
        </>
      )}
    </>
  );
}
