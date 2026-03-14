const MONTHS_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

export function formatDateLong(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()}. ${MONTHS_DE[d.getMonth()]} ${d.getFullYear()}`
}

export function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${s.getDate()}. – ${e.getDate()}. ${MONTHS_DE[e.getMonth()]} ${e.getFullYear()}`
  }
  if (s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}. ${MONTHS_DE[s.getMonth()]} – ${e.getDate()}. ${MONTHS_DE[e.getMonth()]} ${e.getFullYear()}`
  }
  return `${formatDateLong(start)} – ${formatDateLong(end)}`
}
