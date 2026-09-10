export function toLocalDateTime(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  const pad = (number: number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromLocalDateTime(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || toLocalDateTime(date.toISOString()) !== value) {
    throw new Error("Choose a valid date and time in your timezone.");
  }
  return date.toISOString();
}

export function publicationLabel(published: boolean, publishAt: string | null): string {
  if (!published) return "Draft";
  if (publishAt && new Date(publishAt).getTime() > Date.now()) {
    return `Scheduled · ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(publishAt))}`;
  }
  return "Published";
}
