// src/components/RequireAdmin.tsx
import { Navigate } from "react-router-dom";
import Layout from "./Layout";
import { useAuth } from "../context/AuthContext";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="font-mono text-xs text-danger mb-3 tracking-wide">// accesso negato</p>
          <h1 className="text-xl font-semibold text-ink mb-2">Non hai i permessi</h1>
          <p className="text-dim text-sm">Questa sezione è riservata all'amministratore del blog.</p>
        </div>
      </Layout>
    );
  }

  return <>{children}</>;
}
