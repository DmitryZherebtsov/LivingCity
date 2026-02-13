import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  MapPin,
  Users,
  Settings,
  BarChart3,
  UserCog
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/context/AuthContext";

export function AdminSidebar() {

  const { user } = useAuth();

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Panel główny" },
    { to: "/events", icon: CalendarDays, label: "Wydarzenia" },

    ...(isAdmin
      ? [
          { to: "/analytics", icon: BarChart3, label: "Analityka" },
          { to: "/staff", icon: UserCog, label: "Zespół" },
          { to: "/users", icon: Users, label: "Użytkownicy" },
        ]
      : []),

    { to: "/settings", icon: Settings, label: "Ustawienia" },
  ];

  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-16 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 hover:w-56 group">
      <div className="h-16 flex items-center justify-center border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center">
          <MapPin className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <span className="ml-3 font-semibold text-sidebar-accent-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          LivingCity Panel
        </span>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "sidebar-link",
                isActive && "sidebar-link-active"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-2 pb-4 space-y-1 border-t border-sidebar-border pt-4">
        {/* <button className="sidebar-link w-full">
          <Search className="w-5 h-5 flex-shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Szukaj
          </span>
        </button>

        <button className="sidebar-link w-full relative">
          <Bell className="w-5 h-5 flex-shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Powiadomienia
          </span>
          <span className="absolute top-2 left-6 w-2 h-2 bg-destructive rounded-full" />
        </button> */}

        <UserMenu />
      </div>
    </aside>
  );
}
