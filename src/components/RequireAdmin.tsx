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
          <h1 className="text-2xl font-bold text-[#00ff99] mb-3">Accesso negato</h1>
          <p className="text-gray-400">Questa sezione è riservata all'amministratore del blog.</p>
        </div>
      </Layout>
    );
  }

  return <>{children}</>;
}
