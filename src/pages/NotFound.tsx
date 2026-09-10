import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Seo from "../components/Seo";

export default function NotFound() {
  return <Layout>
    <Seo title="Pagina non trovata" description="La pagina richiesta non è disponibile." noIndex />
    <div className="text-center py-16">
      <p className="font-mono text-xs text-signal mb-3">404</p>
      <h1 className="text-2xl font-semibold text-ink mb-4">Page not found</h1>
      <Link to="/" className="text-sm text-signal hover:underline">Back to home</Link>
    </div>
  </Layout>;
}
