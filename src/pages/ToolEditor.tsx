import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import PublicationFields from "../components/PublicationFields";
import Seo from "../components/Seo";
import { apiFetch } from "../lib/api";
import type { Tool } from "../types/tool";

const empty = { name: "", category: "", description: "", howTo: "", href: "", image: "", badge: "", published: true, publish_at: null as string | null };
const fields = [
  { key: "name", label: "Name", max: 120 },
  { key: "category", label: "Category", max: 80 },
  { key: "description", label: "Description", max: 2000, multiline: true },
  { key: "howTo", label: "Getting started", max: 4000, multiline: true },
  { key: "href", label: "Tool URL", max: 2048 },
  { key: "image", label: "Cover image URL (optional)", max: 2048, optional: true },
  { key: "badge", label: "Badge (optional, e.g. Web or Open source)", max: 80, optional: true },
] as const;
const inputClass = "w-full p-2.5 rounded-md bg-panel border border-line text-ink focus:outline-none focus:border-signal";

export default function ToolEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tool, setTool] = useState(empty);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [loaded, setLoaded] = useState(!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    apiFetch<{ tools: Tool[] }>("/api/tools").then((data) => {
      if (active) setCategories([...new Set(data.tools.map((item) => item.category))].sort());
    }).catch(() => {});
    if (id) apiFetch<{ tool: Tool }>(`/api/tools?id=${encodeURIComponent(id)}`)
      .then((data) => { if (active) { setTool(data.tool); setLoaded(true); } })
      .catch((e) => { if (active) setError(e instanceof Error ? e.message : "Unable to load tool"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true); setError("");
    try {
      await apiFetch(id ? `/api/tools?id=${encodeURIComponent(id)}` : "/api/tools", { method: id ? "PUT" : "POST", body: JSON.stringify(tool) });
      navigate("/dashboard/tools");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save tool"); }
    finally { setSaving(false); }
  }
  return <Layout>
    <Seo title={id ? "Modifica tool" : "Nuovo tool"} description="Gestione tools" noIndex />
    <h1 className="text-2xl font-semibold text-ink mb-6">{id ? "Edit tool" : "New tool"}</h1>
    {loading && <p className="text-dim" role="status">Loading...</p>}
    {error && <p className="text-danger mb-4" role="alert">{error}</p>}
    {!loading && loaded && <form onSubmit={save} className="flex flex-col gap-4">
      <fieldset disabled={saving} className="flex flex-col gap-4 disabled:opacity-60">
        {fields.map((field) => <label key={field.key} className="flex flex-col gap-1.5 text-sm text-dim">
          {field.label}
          {"multiline" in field ? <textarea rows={4} required maxLength={field.max} className={inputClass} value={tool[field.key]} onChange={(e) => setTool({ ...tool, [field.key]: e.target.value })} /> :
            <input type={field.key === "href" ? "url" : "text"} required={!("optional" in field)} maxLength={field.max} list={field.key === "category" ? "tool-categories" : undefined} className={inputClass} value={tool[field.key]} onChange={(e) => setTool({ ...tool, [field.key]: e.target.value })} />}
        </label>)}
        <datalist id="tool-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist>
        <p className="text-xs text-dim">Choose an existing category or type a new one. You can add a cover image later using its URL.</p>
        <PublicationFields published={tool.published} publishAt={tool.publish_at} onChange={(published, publish_at) => setTool({ ...tool, published, publish_at })} />
      </fieldset>
      <button disabled={saving} className="self-start px-5 py-2 rounded-md bg-signal text-white text-sm disabled:opacity-60">{saving ? "Saving..." : "Save tool"}</button>
    </form>}
    <Link to="/dashboard/tools" className="inline-block mt-5 text-sm text-dim hover:text-ink">Back to tools dashboard</Link>
  </Layout>;
}
