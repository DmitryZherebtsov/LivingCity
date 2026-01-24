import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  MapPin,
  Users,
  Settings,
  BarChart3,
  Search,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/events", icon: CalendarDays, label: "Events" },
  { to: "/map", icon: MapPin, label: "Map View" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/users", icon: Users, label: "Users" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-16 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 hover:w-56 group">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center">
          <MapPin className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <span className="ml-3 font-semibold text-sidebar-accent-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          EventMap
        </span>
      </div>

      {/* Navigation */}
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

      {/* Bottom actions */}
      <div className="px-2 pb-4 space-y-1 border-t border-sidebar-border pt-4">
        <button className="sidebar-link w-full">
          <Search className="w-5 h-5 flex-shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Search
          </span>
        </button>
        <button className="sidebar-link w-full relative">
          <Bell className="w-5 h-5 flex-shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Notifications
          </span>
          <span className="absolute top-2 left-6 w-2 h-2 bg-destructive rounded-full" />
        </button>
        <UserMenu />
      </div>
    </aside>
  );
}
