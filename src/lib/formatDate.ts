// Turns an API timestamp such as "2026-08-01T09:00:00.000Z" into "Aug 1, 2026".
// Falls back to the original text if the value is not a valid date, so a bad
// value is still visible instead of rendering "Invalid Date".
export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}
