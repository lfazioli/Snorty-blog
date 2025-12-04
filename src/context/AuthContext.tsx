// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken as saveToken, clearToken, parseJwt } from "../lib/auth";

type User = { userId: number; email: string } | null;

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const t = getToken();
    setToken(t);
    if (t) {
      const payload = parseJwt<{ userId: number; email: string }>(t);
      if (payload?.userId && payload?.email) {
        setUser({ userId: payload.userId, email: payload.email });
      }
    }
  }, []);

  function login(newToken: string) {
    saveToken(newToken);
    setToken(newToken);
    const payload = parseJwt<{ userId: number; email: string }>(newToken);
    setUser(payload?.userId && payload?.email ? { userId: payload.userId, email: payload.email } : null);
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

export function useAuth() {
  return useContext(AuthContext);
}
