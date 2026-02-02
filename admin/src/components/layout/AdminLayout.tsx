import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Outlet } from "react-router-dom";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-16 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
