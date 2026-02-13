import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Mail, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { fetchUsers, type UserDTO } from "@/services/usersService";

const statusStyles = {
  aktywny: "bg-success/10 text-success",
  nieaktywny: "bg-muted text-muted-foreground",
  oczekujący: "bg-warning/10 text-warning",
} as const;

type LokalnyUzytkownik = {
  id: string | number;
  name: string;
  email: string;
  role: string;
  status: "aktywny" | "nieaktywny" | "oczekujący";
  events: number;
  joined: string;
};

export default function Uzytkownicy() {
  const [wyszukiwanie, setWyszukiwanie] = useState("");
  const [uzytkownicy, setUzytkownicy] = useState<LokalnyUzytkownik[]>([]);
  const [ladowanie, setLadowanie] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const dane: UserDTO[] = await fetchUsers();
        if (!mounted) return;

        const tylkoZwykli: LokalnyUzytkownik[] = dane
          .filter(
            (u) =>
              // (u.role_id && String(u.role_id) === "eb778bbf-8376-49db-b618-4e85c8707444") ||
              (u.role_name && String(u.role_name).toLowerCase() === "user")
          )
          .map((u) => {
            const statusValue: "aktywny" | "nieaktywny" | "oczekujący" =
              typeof u.is_active === "boolean"
                ? u.is_active
                  ? "aktywny"
                  : "nieaktywny"
                : "aktywny";
            return {
              id: u.id,
              name: u.name ?? u.email ?? "Brak nazwy",
              email: u.email ?? "—",
              role: "Użytkownik",
              status: statusValue,
              events: 0,
              joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : "—",
            };
          });

        setUzytkownicy(tylkoZwykli);
      } catch (error) {
        console.error("Błąd pobierania użytkowników", error);
        setUzytkownicy([]);
      } finally {
        if (mounted) setLadowanie(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const przefiltrowani = uzytkownicy.filter((u) =>
    (u.name + u.email).toLowerCase().includes(wyszukiwanie.toLowerCase())
  );

  const inicjaly = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0] || "")
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Użytkownicy</h1>
          <p className="page-description">Zarządzanie zwykłymi użytkownikami</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Dodaj użytkownika
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Szukaj użytkownika..."
            value={wyszukiwanie}
            onChange={(e) => setWyszukiwanie(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Użytkownik</TableHead>
              <TableHead>Rola</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data rejestracji</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ladowanie ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="py-6 text-center">Ładowanie użytkowników...</div>
                </TableCell>
              </TableRow>
            ) : przefiltrowani.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="py-6 text-center">Brak użytkowników</div>
                </TableCell>
              </TableRow>
            ) : (
              przefiltrowani.map((u) => (
                <TableRow key={u.id} className="cursor-pointer">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {inicjaly(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusStyles[u.status]}>
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.joined}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <UserCircle className="w-4 h-4 mr-2" />
                          Zobacz profil
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Wyślij wiadomość
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Wyświetlono {przefiltrowani.length} z {uzytkownicy.length} użytkowników</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Poprzednia</Button>
          <Button variant="outline" size="sm">Następna</Button>
        </div>
      </div>
    </div>
  );
}
