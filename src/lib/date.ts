export interface DateFormatContext {
  locale: string;
  timeZone: string;
}

export function formatDate(iso: string, {locale, timeZone}: DateFormatContext): string {
  return new Intl.DateTimeFormat(locale, {dateStyle: 'medium', timeZone}).format(new Date(iso));
}

/** Compact month + day, e.g. "Oct 22". */
export function formatShortDate(iso: string, {locale, timeZone}: DateFormatContext): string {
  return new Intl.DateTimeFormat(locale, {month: 'short', day: 'numeric', timeZone}).format(
    new Date(iso),
  );
}

export function formatDateTime(iso: string, {locale, timeZone}: DateFormatContext): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(iso));
}
