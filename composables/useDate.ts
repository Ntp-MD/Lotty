export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}
