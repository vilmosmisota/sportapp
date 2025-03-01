"use client";

import { createContext, useContext, ReactNode } from "react";
import { UserRole } from "@/entities/role/Role.schema";

interface User {
  id: string;
  roles?: UserRole[] | null;
}

interface Session {
  user?: User | null;
}

interface SessionContextType {
  session: Session | null;
}

const SessionContext = createContext<SessionContextType>({ session: null });

export function SessionProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) {
  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
