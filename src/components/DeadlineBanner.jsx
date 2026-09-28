import { formatDate, DEADLINE_DAYS } from '../utils/dates'

export default function DeadlineBanner({ deadlineEnd, receiptDate, generic = false }) {
  if (!deadlineEnd && !generic) return null

  return (
    <div
      className="sticky top-0 z-10 border-b border-accent/20 bg-accent-light px-4 py-3 text-center"
      role="status"
      aria-live="polite"
    >
      {deadlineEnd ? (
        <>
          <p className="text-sm font-semibold text-accent">
            Deadline: {formatDate(deadlineEnd)}
          </p>
          {receiptDate && (
            <p className="text-sm font-normal text-warm-800">
              {DEADLINE_DAYS} days from receipt ({formatDate(receiptDate)})
            </p>
          )}
        </>
      ) : (
        <p className="text-sm font-semibold text-accent">
          You have {DEADLINE_DAYS} days from when you received the letter.
        </p>
      )}
    </div>
  )
}
