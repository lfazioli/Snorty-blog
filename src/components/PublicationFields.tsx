import { toLocalDateTime, fromLocalDateTime } from "../lib/publication";
import { useState } from "react";

type Props = {
  published: boolean;
  publishAt: string | null;
  onChange: (published: boolean, publishAt: string | null) => void;
  disabled?: boolean;
};

export default function PublicationFields({ published, publishAt, onChange, disabled }: Props) {
  const [scheduled, setScheduled] = useState(Boolean(publishAt));
  const mode = !published ? "draft" : (scheduled || publishAt ? "scheduled" : "now");
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return <fieldset disabled={disabled} className="rounded-lg border border-line p-4 space-y-4">
    <legend className="px-2 text-sm text-ink">Publication</legend>
    <label className="flex flex-col gap-2 text-sm text-dim">Visibility
      <select className="p-2.5 rounded-md bg-panel border border-line text-ink" value={mode} onChange={(event) => {
        const next = event.target.value;
        setScheduled(next === "scheduled");
        onChange(next !== "draft", next === "scheduled" ? publishAt : null);
      }}>
        <option value="draft">Draft</option>
        <option value="now">Publish now</option>
        <option value="scheduled">Schedule publication</option>
      </select>
    </label>
    {mode === "scheduled" && <label className="flex flex-col gap-2 text-sm text-dim">Publication date and time
      <input type="datetime-local" required step="60" value={toLocalDateTime(publishAt)} className="p-2.5 rounded-md bg-panel border border-line text-ink" onChange={(event) => {
        event.target.setCustomValidity("");
        if (!event.target.value) { onChange(true, null); return; }
        try { onChange(true, fromLocalDateTime(event.target.value)); }
        catch { event.target.setCustomValidity("This time does not exist in your timezone. Choose another time."); event.target.reportValidity(); }
      }} />
      <span className="text-xs">Timezone: {timezone}. Hidden until this time. A past date publishes immediately.</span>
    </label>}
    {mode === "draft" && <p className="text-xs text-dim">Only visible in your dashboard. No automatic publication.</p>}
  </fieldset>;
}
