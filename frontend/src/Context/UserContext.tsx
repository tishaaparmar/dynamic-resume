// src/Context/UserContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "@/lib/api";

type User = {
  id?: string;
  name: string;
  email?: string;
} | null;

type UserContextType = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On app load, try to fetch currently logged-in user
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me"); // proxied to backend /api/auth/me
        setUser(res.data.user ?? null);
      } catch (err: any) {
        // Silently handle 401 errors (no valid token)
        if (err.response?.status !== 401) {
          console.error("Error fetching user:", err);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};
