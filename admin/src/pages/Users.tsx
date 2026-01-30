import { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreHorizontal, Mail, Shield, UserCircle } from "lucide-react";
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

const roleStyles = {
  Admin: "bg-primary/10 text-primary",
  Manager: "bg-warning/10 text-warning",
  User: "bg-muted text-muted-foreground",
};

const statusStyles = {
  active: "bg-success/10 text-success",
  inactive: "bg-muted text-muted-foreground",
  pending: "bg-warning/10 text-warning",
};

type LocalUser = {
  id: string | number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  events: number;
  joined: string;
};

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data: UserDTO[] = await fetchUsers();
        if (!mounted) return;

        const mapped = data.map((u) => {
          const name = u.name ?? u.email ?? "Unnamed";
          const role = (u.role_name ?? "User").charAt(0).toUpperCase() + (u.role_name ?? "user").slice(1);
          const isActive = typeof u.is_active === "boolean" ? u.is_active : true;
          return {
            id: u.id,
            name,
            email: u.email,
            role,
            status: isActive ? "active" : "inactive",
            events: 0,
            joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : "—",
          } as LocalUser;
        });

        setUsers(mapped);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setUsers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredUsers = users.filter(user =>
    (user.name + user.email).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0] || "").join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Users</h1>
          <p className="page-description">Manage user accounts and permissions</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search users..."
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

      {/* Users Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium">User</TableHead>
              <TableHead className="font-medium">Role</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium text-center">Events</TableHead>
              <TableHead className="font-medium">Joined</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="py-6 text-center">Loading users...</div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="py-6 text-center">No users found</div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="cursor-pointer">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={roleStyles[user.role as keyof typeof roleStyles] ?? ""}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusStyles[user.status]}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{user.events}</TableCell>
                  <TableCell className="text-muted-foreground">{user.joined}</TableCell>
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
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="w-4 h-4 mr-2" />
                          Change Role
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
        <span>Showing {filteredUsers.length} of {users.length} users</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}
