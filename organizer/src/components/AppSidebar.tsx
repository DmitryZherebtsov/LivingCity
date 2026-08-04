import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarPlus,
  Building2,
  LogOut,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/authService";

const navItems = [
  { label: "Panel główny", path: "/dashboard", icon: LayoutDashboard },
  { label: "Utwórz wydarzenie", path: "/events/create", icon: CalendarPlus },
  { label: "Organizacja", path: "/settings", icon: Building2 },
];

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("accessToken");

  let email = "";
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      email = payload.email || "";
    } catch {
      email = "";
    }
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex flex-col items-center border-b p-5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-3">
          <MapPin className="w-7 h-7 text-primary-foreground" />
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold">Panel Organizatora</p>
          <p className="text-xs text-muted-foreground truncate">
            {email}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Wyloguj się
        </Button>
      </div>
    </aside>
  );
};

export default AppSidebar;
