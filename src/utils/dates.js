const STORAGE_KEY = 'brief-orientierung-deadline'

export function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function parseDateInput(value) {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return null
  const date = new Date(y, m - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return null
  }
  return date
}

export function toDateInputValue(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function saveDeadlineToStorage(receiptDate, deadlineEnd) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      receiptDate: receiptDate.toISOString(),
      deadlineEnd: deadlineEnd.toISOString(),
    }),
  )
}

export function loadDeadlineFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return {
      receiptDate: new Date(data.receiptDate),
      deadlineEnd: new Date(data.deadlineEnd),
    }
  } catch {
    return null
  }
}

export function downloadIcsEvent({ title, startDate, description }) {
  const pad = (n) => String(n).padStart(2, '0')
  const formatIcsDate = (date) =>
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Letter Guide//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:letter-deadline-${Date.now()}@letter-guide.local`,
    `DTSTAMP:${formatIcsDate(new Date())}T000000`,
    `DTSTART;VALUE=DATE:${formatIcsDate(startDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'rent-increase-deadline.ics'
  link.click()
  URL.revokeObjectURL(url)
}

export const LETTER_TYPES = [
  { id: 'mietzinserhohung', label: 'Rent increase' },
  { id: 'kuendigung', label: 'Eviction notice' },
  { id: 'betreibung', label: 'Debt collection' },
  { id: 'versicherung', label: 'Insurance claim denied' },
  { id: 'anderes', label: 'Other' },
]

export const DEADLINE_DAYS = 30
