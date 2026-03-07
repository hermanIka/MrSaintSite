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
