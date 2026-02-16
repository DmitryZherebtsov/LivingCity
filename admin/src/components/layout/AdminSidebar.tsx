import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  MapPin,
  Users,
  Settings,
  BarChart3,
  UserCog,
  BookCheck,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/context/AuthContext";

export function AdminSidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const role = user?.role?.toLowerCase();

  const isAdmin = role === "admin";
  const isModerator = role === "moderator";
  // const isOrganizer = role === "organizer";

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Panel główny" },
    { to: "/events", icon: CalendarDays, label: "Wydarzenia" },

    ...(isAdmin
      ? [
          { to: "/analytics", icon: BarChart3, label: "Analityka" },
          { to: "/staff", icon: UserCog, label: "Zespół" },
          { to: "/users", icon: Users, label: "Użytkownicy" },
          { to: "/organizations", icon: BookCheck, label: "Organizacje" },
          { to: "/events-pending", icon: ClipboardCheck, label: "Weryfikacja wydarzeń" },
        ]
      : []),
    

    { to: "/settings", icon: Settings, label: "Ustawienia" },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-16 border-r flex flex-col transition-all duration-300 hover:w-56 group",
        isAdmin && "bg-sidebar border-sidebar-border",
        isModerator && "bg-green-950 border-green-900"
      )}>

      <div className="h-16 flex items-center justify-center border-b border-sidebar-border">
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center",
            isAdmin && "bg-sidebar-primary",
            isModerator && "bg-green-600"
          )}
        >
          <MapPin
            className={cn(
              "w-5 h-5",
              isAdmin && "text-sidebar-primary-foreground",
              (isModerator) && "text-white"
            )}
          />
        </div>

        <span
          className={cn(
            "ml-3 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap",
            isAdmin && "text-sidebar-accent-foreground",
            isModerator && "text-green-200"
          )}
        >
          LivingCity Panel
        </span>
      </div>

      <h4
        className={cn(
          "h-14 flex items-center justify-center border-b capitalize font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap",
          isAdmin && "text-white border-sidebar-border",
          isModerator && "text-green-300 border-green-900"
        )}
      >
        {role}
      </h4>


      <nav className="flex-1 px-2 py-4 space-y-1 overflow-hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "opacity-80 hover:opacity-100",
                isAdmin && "text-sidebar-foreground hover:bg-sidebar-accent",
                isModerator && "text-green-200 hover:bg-green-900",
                isActive &&
                  (isAdmin
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : isModerator
                    ? "bg-green-800 text-white font-medium"
                    : "bg-orange-800 text-white font-medium")
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

      {/* 
      <button className="sidebar-link w-full">
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
      </button> 
      */}

      <div className="px-2 pb-4 space-y-1 border-t border-sidebar-border pt-4">
        <UserMenu />
      </div>
    </aside>
  );
}
