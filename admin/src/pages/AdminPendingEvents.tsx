import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, X, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function AdminPendingEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/events?status=pending");
      setEvents(res.data || []);
    } catch (err: any) {
      toast({
        title: "Błąd",
        description: err.response?.data?.error || "Nie można pobrać wydarzeń",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
      event: any,
      status: "approve" | "reject"
    ) => {

      let reason = null;

      if (status === "reject") {
        reason = window.prompt(
          `Podaj powód odrzucenia wydarzenia "${event.title}":`
        );

        if (!reason) {
          toast({
            title: "Błąd",
            description: "Musisz podać powód odrzucenia",
            variant: "destructive",
          });
          return;
        }
      } else {
        const ok = window.confirm(
          `Zatwierdzić wydarzenie "${event.title}"?`
        );
        if (!ok) return;
      }

      try {
        await api.patch(`/api/events/${status}/${event.id}`, {
          reason: reason,  
        });

        setEvents((s) => s.filter((e) => e.id !== event.id));
        if (selected?.id === event.id) setSelected(null);

        toast({
          title:
            status === "approve"
              ? "Wydarzenie zatwierdzone"
              : "Wydarzenie odrzucone",
        });

      } catch (err: any) {
        toast({
          title: "Błąd",
          description: err.response?.data?.error || "Operacja nie powiodła się",
          variant: "destructive",
        });
      }
    };


  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.city?.toLowerCase().includes(q) ||
        e.organizer?.toLowerCase().includes(q)
    );
  }, [events, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-header">Weryfikacja wydarzeń</h1>
          <p className="page-description">
            Zgłoszenia oczekujące na zatwierdzenie
          </p>
        </div>

        <div className="relative">
          <Input
            placeholder="Szukaj tytuł, miasto..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Wydarzenie</TableHead>
              <TableHead>Miasto</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Organizator</TableHead>
              <TableHead className="text-right w-48">Akcje</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="py-6 text-center">Ładowanie...</div>
                </TableCell>
              </TableRow>
            ) : pageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="py-6 text-center">
                    Brak oczekujących wydarzeń
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((ev) => (
                <TableRow
                  key={ev.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => setSelected(ev)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {ev.first_image?.filename ? (
                        <img
                          src={`${BASE_URL}/uploads/events/${ev.id}/${ev.first_image.filename}`}
                          className="h-10 w-16 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-16 bg-muted rounded flex items-center justify-center text-xs">
                          brak
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{ev.title}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                          {ev.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{ev.city || "—"}</TableCell>

                  <TableCell>
                    {ev.start_time
                      ? new Date(ev.start_time).toLocaleString()
                      : "—"}
                  </TableCell>

                  <TableCell>{ev.organizer || "—"}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(ev, "approve");
                        }}
                      >
                        <Check className="w-4 h-4 mr-1" /> OK
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(ev, "reject");
                        }}
                      >
                        <X className="w-4 h-4 mr-1" /> Odrzuć
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>






      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setSelected(null)}
          />
          <aside className="fixed right-0 top-0 h-full w-full sm:w-[600px] z-50 bg-card border-l p-6 overflow-auto space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{selected.title}</h2>
                <Badge className="mt-2 bg-yellow-100 text-yellow-800">
                  pending
                </Badge>
              </div>
              <Button variant="ghost" onClick={() => setSelected(null)}>
                Zamknij
              </Button>
            </div>

            {/* GALERIA */}
            {selected.images?.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Galeria</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selected.images.map((img: any) => (
                    <img
                      key={img.id}
                      src={`${BASE_URL}/uploads/events/${selected.id}/${img.filename}`}
                      className="w-full h-40 object-cover rounded-lg shadow"
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-medium mb-1">Opis</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {selected.description || "—"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Miasto:</strong> {selected.city || "—"}
              </div>
              <div>
                <strong>Adres:</strong> {selected.address || "—"}
              </div>
              <div>
                <strong>Start:</strong>{" "}
                {selected.start_time
                  ? new Date(selected.start_time).toLocaleString()
                  : "—"}
              </div>
              <div>
                <strong>Koniec:</strong>{" "}
                {selected.end_time
                  ? new Date(selected.end_time).toLocaleString()
                  : "—"}
              </div>
              <div>
                <strong>Pojemność:</strong> {selected.capacity || "—"}
              </div>
              <div>
                <strong>Typ:</strong> {selected.event_type || "—"}
              </div>
              <div>
                <strong>Free:</strong> {selected.is_free ? "Tak" : "Nie"}
              </div>
              <div>
                <strong>Organizator:</strong> {selected.organizer || "—"}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={() => handleUpdateStatus(selected, "approve")}
              >
                <Check className="w-4 h-4 mr-2" /> Zatwierdź
              </Button>

              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleUpdateStatus(selected, "reject")}
              >
                <X className="w-4 h-4 mr-2" /> Odrzuć
              </Button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
