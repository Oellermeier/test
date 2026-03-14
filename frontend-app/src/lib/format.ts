const DE = 'de-DE'

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat(DE, { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(dateStr))
}

export function formatShortDate(dateStr: string): string {
  return new Intl.DateTimeFormat(DE, { weekday: 'short', day: 'numeric', month: 'short' })
    .format(new Date(dateStr))
}

export function formatDateRange(start?: string | null, end?: string | null): string {
  if (!start) return ''
  const fmt = (d: string, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(DE, opts).format(new Date(d))
  if (!end) return fmt(start, { day: 'numeric', month: 'long', year: 'numeric' })
  return `${fmt(start, { day: 'numeric', month: 'short' })} – ${fmt(end, { day: 'numeric', month: 'short', year: 'numeric' })}`
}

/** YYYY-MM-DD des heutigen Tages (UTC) */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}
