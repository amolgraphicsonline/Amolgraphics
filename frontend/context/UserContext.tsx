"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface UserContextType {
  user: AuthUser | null;
  isLoaded: boolean;
  isLoggingIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Always send cookies with requests (required for httpOnly session cookie)
const authFetch = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    credentials: "include", // ✅ Sends httpOnly cookie automatically
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // On mount — verify session with server via /auth/me
  const refreshUser = async () => {
    try {
      const res = await authFetch(`${API_URL}/auth/me`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = async () => {
    try {
      await authFetch(`${API_URL}/auth/logout`, { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null); // Server clears the cookie
      localStorage.removeItem('amol_cart');
    }
  };

  // --- IDLE LOGOUT LOGIC (15 MINS) ---
  useEffect(() => {
    if (!user) return;

    let idleTimer: NodeJS.Timeout;
    const IDLE_TIME_LIMIT = 15 * 60 * 1000; // 15 mins

    const handleIdleLogout = () => {
      console.warn("Session expired due to 15 minutes of inactivity.");
      logout();
    };

    const resetTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(handleIdleLogout, IDLE_TIME_LIMIT);
    };

    // Events that indicate activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Initialize timer
    resetTimer();

    return () => {
      clearTimeout(idleTimer);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]); // We only trigger this when 'user' state changes (login/logout)

  const login = async (email: string, password: string) => {
    setIsLoggingIn(true);
    try {
      const res = await authFetch(`${API_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      setUser(data.user); // Cookie is set server-side automatically
    } finally {
      setIsLoggingIn(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoggingIn(true);
    try {
      const res = await authFetch(`${API_URL}/auth/register`, {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setUser(data.user);
      localStorage.removeItem('amol_cart');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoaded, isLoggingIn, login, register, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};
