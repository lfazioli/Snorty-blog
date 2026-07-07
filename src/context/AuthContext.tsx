// src/context/AuthContext.tsx
import React, { createContext, useContext, useState } from "react";
import { getToken, setToken as saveToken, clearToken, parseJwt } from "../lib/auth";

type Role = "admin" | "reader";
type User = { userId: number; email: string; role: Role } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

function userFromToken(t: string | null): User {
  if (!t) return null;
  const payload = parseJwt<{ userId: number; email: string; role?: string }>(t);
  if (!payload?.userId || !payload?.email) return null;
  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role === "admin" ? "admin" : "reader",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Stato iniziale calcolato in modo sincrono (lazy initializer) invece che in un
  // useEffect: cosi' il primo render e' gia' corretto, senza un "flash" in cui
  // l'utente sembra disconnesso finche' l'effect non parte.
  const [token, setToken] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<User>(() => userFromToken(getToken()));

  function login(newToken: string) {
    saveToken(newToken);
    setToken(newToken);
    setUser(userFromToken(newToken));
  }

  function logout() {
    clearToken();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- pattern standard context+hook
export function useAuth() {
  return useContext(AuthContext);
}
