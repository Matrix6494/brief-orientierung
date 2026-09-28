const STEPS = [
  {
    number: 1,
    title: 'Show your letter',
    text: 'Take a photo or choose the letter type.',
  },
  {
    number: 2,
    title: 'Understand',
    text: 'We tell you what matters.',
  },
  {
    number: 3,
    title: 'Next step',
    text: 'You see what you can do.',
  },
]

export default function ProcessPreview() {
  return (
    <section aria-labelledby="process-heading" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-warm-200">
      <h2 id="process-heading" className="mb-4 text-base font-semibold text-warm-900">
        How it works
      </h2>
      <ol className="space-y-4">
        {STEPS.map((step) => (
          <li key={step.number} className="flex gap-4">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary"
              aria-hidden="true"
            >
              {step.number}
            </span>
            <div>
              <p className="font-semibold text-warm-900">{step.title}</p>
              <p className="text-base leading-relaxed text-warm-800">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-muted">Takes about 2 minutes.</p>
    </section>
  )
}
