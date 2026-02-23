import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
// import OrganizerAuth from "./pages/OrganizerAuth";
// import OrganizerWaiting from "./pages/OrganizerWaiting";
import Events from "./pages/Events";
import Analytics from "./pages/Analytics";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Staff from "./pages/Staff";
import AdminOrganizations from "./pages/AdminOrganizations";
import AdminPendingEvents from "./pages/AdminPendingEvents";
// import CreateEventPage from "./pages/CreateEventPage";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />

          <Routes>

            <Route path="/auth" element={<Auth />} />

            {/* Organizer auth  TO DELETE
            <Route path="/organizer/auth" element={<OrganizerAuth />} />
            <Route path="/organizer/waiting" element={<OrganizerWaiting />} /> */}

            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >

            <Route path="/" element={
                <ProtectedRoute allowedRoles={["admin", "moderator"]}>
                  <Index />
                </ProtectedRoute>
              } />

            <Route path="/events" element={
                 <ProtectedRoute allowedRoles={["admin", "moderator"]}>
                  <Events />
                </ProtectedRoute>
                } />

            <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/staff"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Staff />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Users />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/organizations"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminOrganizations />
                  </ProtectedRoute>
                }
              />

              <Route 
                path="/events-pending" 
                element={
                   <ProtectedRoute allowedRoles={["admin", "moderator"]}>
                    <AdminPendingEvents />
                  </ProtectedRoute>
                  } />


              <Route path="/settings" element={<Settings />} />
            </Route>

          
            <Route path="*" element={<NotFound />} />

          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
