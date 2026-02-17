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
import { Check, X, Search, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type OrganizationRaw = {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  website?: string | null;
  contact_email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  logo_url?: string | null;
  nip_krs?: string | null;
  metadata?: Record<string, any>;
  status: "pending" | "approved" | "rejected" | string;
  created_at: string;
  updated_at?: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AdminOrganizations() {
  const { user, isLoading } = useAuth();

  const [organizations, setOrganizations] = useState<OrganizationRaw[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<OrganizationRaw | null>(null);
  const [statusFilter, setStatusFilter] = useState<"approved" | "pending" | "rejected">("pending");


  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  useEffect(() => {
    if (!isLoading && user?.role === "admin") {
      fetchOrganizations();
    }
  }, [isLoading, user]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/admin/organizations?status=${statusFilter}`);
      setOrganizations(res.data || []);
    } catch (err: any) {
      console.error("fetchOrganizations error:", err);
      if (err.response?.status === 401) {
        toast({
          title: "Brak autoryzacji",
          description: "Zaloguj się ponownie jako administrator",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Błąd pobierania organizacji",
          description: err.response?.data?.error || "Wystąpił błąd serwera",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
  org: OrganizationRaw,
  status: "approved" | "rejected"
) => {

  let reason = undefined;

  if (status === "rejected") {
    reason = window.prompt(
      `Podaj powód odrzucenia organizacji "${org.name}":`
    );

    if (!reason || reason.trim().length < 3) {
      toast({
        title: "Musisz podać powód odrzucenia",
        variant: "destructive",
      });
      return;
    }
  }

  const ok = window.confirm(
    `Czy na pewno chcesz ${
      status === "approved" ? "zatwierdzić" : "odrzucić"
    } organizację "${org.name}"?`
  );

  if (!ok) return;

  const prev = organizations;
  setOrganizations((s) => s.filter((o) => o.id !== org.id));
  if (selected?.id === org.id) setSelected(null);

  try {
    await api.patch(`/api/admin/organizations/${org.id}/status`, {
      status,
      reason,
    });

    toast({
      title:
        status === "approved"
          ? "Organizacja zatwierdzona"
          : "Organizacja odrzucona",
    });

  } catch (err: any) {
    setOrganizations(prev);

    toast({
      title: "Błąd aktualizacji",
      description:
        err.response?.data?.error || "Nie udało się zmienić statusu",
      variant: "destructive",
    });
  }
};


  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return organizations;
    return organizations.filter((o) => {
      return (
        (o.name || "").toLowerCase().includes(q) ||
        (o.contact_email || "").toLowerCase().includes(q) ||
        (o.phone || "").toLowerCase().includes(q) ||
        (o.city || "").toLowerCase().includes(q) ||
        (o.nip_krs || "").toLowerCase().includes(q)
      );
    });
  }, [organizations, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (!isLoading && user?.role !== "admin") {
    return (
      <div className="p-8 text-center text-destructive font-medium">
        Brak dostępu
      </div>
    );
  }

  useEffect(() => {
    if (!isLoading && user?.role === "admin") {
      fetchOrganizations();
    }
  }, [statusFilter]);


  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Organizacje</h1>
          <p className="page-description">Zarządzanie zgłoszeniami organizacji</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              placeholder="Szukaj organizacji, e-mail, NIP..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("");
              fetchOrganizations();
            }}
            size="sm"
          >
            Odśwież
          </Button>
          <div className="flex gap-3">
            <Button variant={statusFilter === "approved" ? "default" : "outline"} onClick={() => setStatusFilter("approved")}>
              Zatwierdzone
            </Button>

            <Button variant={statusFilter === "rejected" ? "default" : "outline"} onClick={() => setStatusFilter("rejected")}>
              Odrzucone
            </Button>


            <Button variant={statusFilter === "pending" ? "default" : "outline"} onClick={() => setStatusFilter("pending")}>
              Nie zatwierdzone
            </Button>

            
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organizacja</TableHead>
              <TableHead>Kontakt</TableHead>
              <TableHead>Miasto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data zgłoszenia</TableHead>
              <TableHead className="w-48 text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="py-6 text-center">Ładowanie organizacji...</div>
                </TableCell>
              </TableRow>
            ) : pageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="py-6 text-center">Brak oczekujących organizacji</div>
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((org) => (
                <TableRow
                  key={org.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => setSelected(org)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {org.logo_url ? (
                        <img
                          src={org.logo_url}
                          alt={org.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-sm text-primary">
                          {org.name?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{org.name}</p>
                        <p className="text-sm text-muted-foreground truncate" style={{ maxWidth: 300 }}>
                          {org.website || "—"}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium">{org.contact_email || "—"}</p>
                      <p className="text-sm text-muted-foreground">{org.phone || "—"}</p>
                    </div>
                  </TableCell>

                  <TableCell>{org.city || "—"}</TableCell>

                  <TableCell>
                    <Badge className={STATUS_STYLES[org.status] || "bg-muted text-muted-foreground"}>
                      {org.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {new Date(org.created_at).toLocaleString()}
                  </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-3">
                  {org.status !== "approved" && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-emerald-400 to-green-500 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(org, "approved");
                      }}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Zatwierdź
                    </Button>
                  )}

                  {org.status === "approved" && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-rose-400 to-red-500 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(org, "rejected");
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Odrzuć
                    </Button>
                  )}
                </div>

                </TableCell>

                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Wyświetlono {filtered.length} organizacji — strona {page}/{totalPages}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Poprzednia
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Następna
          </Button>
        </div>
      </div>



{/* sidepanel for info full */}
      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setSelected(null)}
            aria-hidden
          />
          <aside className="fixed right-0 top-0 h-full w-full sm:w-[520px] z-50 bg-card border-l border-border p-6 overflow-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                {selected.logo_url ? (
                  <img src={selected.logo_url} alt={selected.name} className="h-12 w-12 rounded-md object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-lg text-primary">
                    {selected.name?.slice(0,2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold">{selected.name}</h2>
                  <p className="text-sm text-muted-foreground">{selected.city || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={STATUS_STYLES[selected.status] || "bg-muted text-muted-foreground"}>
                  {selected.status}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                  Zamknij
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Kontakt</h3>
                <p>{selected.contact_email || "—"}</p>
                <p className="text-sm text-muted-foreground">{selected.phone || "—"}</p>
                {selected.website && (
                  <p className="text-sm mt-1">
                    <a href={selected.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary">
                      Strona organizacji <ExternalLink className="w-4 h-4" />
                    </a>
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Adres</h3>
                <p>{selected.address || "—"}</p>
                <p className="text-sm text-muted-foreground">{selected.city || "—"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">NIP / KRS</h3>
                <p>{selected.nip_krs || "—"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Opis</h3>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{selected.description || "—"}</p>
              </div>

              {/* <div>
                <h3 className="text-sm font-medium mb-1">Metadane</h3>
                <pre className="text-xs bg-muted/20 p-2 rounded max-h-40 overflow-auto">{JSON.stringify(selected.metadata || {}, null, 2)}</pre>
              </div> */}

              <div className="flex gap-3 mt-4">
                <Button
                  className="
                    w-36 h-10
                    inline-flex items-center justify-center
                    bg-gradient-to-r from-emerald-400 to-green-500
                    hover:from-emerald-500 hover:to-green-600
                    text-white
                    shadow-lg shadow-emerald-500/30
                    hover:shadow-xl hover:shadow-emerald-500/40
                    transition-all duration-200
                  "
                  onClick={() => handleUpdateStatus(selected, "approved")}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Zatwierdź
                </Button>

                <Button
                  className="
                    w-36 h-10
                    inline-flex items-center justify-center
                    bg-gradient-to-r from-rose-400 to-red-500
                    hover:from-rose-500 hover:to-red-600
                    text-white
                    shadow-lg shadow-rose-500/30
                    hover:shadow-xl hover:shadow-rose-500/40
                    transition-all duration-200
                  "
                  onClick={() => handleUpdateStatus(selected, "rejected")}
                >
                  <X className="w-4 h-4 mr-2" />
                  Odrzuć
                </Button>
              </div>

            </div>
          </aside>
        </>
      )}
    </div>
  );
}
