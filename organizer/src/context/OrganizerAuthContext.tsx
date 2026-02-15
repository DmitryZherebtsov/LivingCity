import React, { createContext, useContext, useEffect, useState } from "react";
import { logout } from "@/lib/auth";

interface OrganizerUser {
  id: string;
  email: string;
  role: "organizer";
  organizationId: string;
}

interface OrganizerAuthContextType {
  user: OrganizerUser | null;
  isLoading: boolean;
  logoutUser: () => void;
}

const OrganizerAuthContext = createContext<
  OrganizerAuthContextType | undefined
>(undefined);

export const OrganizerAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<OrganizerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const organizationId = localStorage.getItem("organizationId");

    if (token && organizationId) {
      setUser({
        id: "organizer",
        email: "",
        role: "organizer",
        organizationId,
      });
    }

    setIsLoading(false);
  }, []);

  const logoutUser = () => {
    logout();
    setUser(null);
  };

  return (
    <OrganizerAuthContext.Provider value={{ user, isLoading, logoutUser }}>
      {children}
    </OrganizerAuthContext.Provider>
  );
};

export const useOrganizerAuth = () => {
  const ctx = useContext(OrganizerAuthContext);
  if (!ctx)
    throw new Error("useOrganizerAuth must be used within OrganizerAuthProvider");
  return ctx;
};
