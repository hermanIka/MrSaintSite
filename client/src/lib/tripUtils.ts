export function calculateTripDuration(startDate: string, endDate: string, lang: string = "fr"): string {
  if (!startDate || !endDate) return "";
  try {
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return "";
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
    if (days <= 0) return "";
    return lang === "en" ? `${days} day${days > 1 ? "s" : ""}` : `${days} jour${days > 1 ? "s" : ""}`;
  } catch {
    return "";
  }
}

export function formatTripDates(startDate: string, endDate: string, lang: string = "fr"): string {
  if (!startDate && !endDate) return "";
  if (!startDate) return endDate;
  if (!endDate) return startDate;

  const locale = lang === "en" ? "en-GB" : "fr-FR";
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  const optsWithYear: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };

  try {
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");

    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    const startStr = start.toLocaleDateString(locale, startYear === endYear ? opts : optsWithYear);
    const endStr = end.toLocaleDateString(locale, optsWithYear);

    return `${startStr} → ${endStr}`;
  } catch {
    return `${startDate} → ${endDate}`;
  }
}
