import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";

export default function Register() {
  return (
    <Layout>
      <Seo title="Registrazione non disponibile" description="Le registrazioni a Snorty Blog sono temporaneamente chiuse." path="/register" noIndex />
      <div className="max-w-sm mx-auto py-8">
        <p className="font-mono text-xs text-signal mb-2 tracking-wide text-center">// registration</p>
        <h1 className="text-2xl font-semibold text-ink mb-8 text-center tracking-tight">Registration temporarily unavailable</h1>

        <div className="rounded-lg border border-line bg-panel p-7 flex flex-col gap-5 text-center">
          <p className="text-sm text-dim leading-relaxed">
            New registrations are currently closed. You can still browse all public
            articles without an account.
          </p>
          <Link
            to="/posts"
            className="bg-signal text-white text-sm font-medium py-2.5 rounded-md hover:bg-signal-600 transition-colors"
          >
            Browse articles
          </Link>
          <Link to="/login" className="text-xs text-dim hover:text-ink transition-colors">
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </Layout>
  );
}
