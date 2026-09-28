import { formatDate, DEADLINE_DAYS } from '../utils/dates'

export default function KeyMessages({ deadlineEnd }) {
  return (
    <section aria-labelledby="key-info-heading" className="mb-8">
      <h2 id="key-info-heading" className="sr-only">
        Key information
      </h2>
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
        <article className="flex flex-col rounded-2xl border-2 border-primary/40 bg-primary-light p-5">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-primary">
            Good to know
          </p>
          <p className="text-lg font-semibold leading-relaxed text-warm-900">
            This is not the final word. You can have the increase reviewed for free.
          </p>
        </article>

        <article className="flex flex-col rounded-2xl border-2 border-accent/40 bg-accent-light p-5">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-accent">
            You can still respond
          </p>
          <p className="text-lg font-semibold leading-relaxed text-warm-900">
            You have {DEADLINE_DAYS} days from when you received the letter to take action.
          </p>
          {deadlineEnd && (
            <p className="mt-2 text-lg font-bold text-accent">
              Deadline: {formatDate(deadlineEnd)}
            </p>
          )}
        </article>
      </div>
    </section>
  )
}
