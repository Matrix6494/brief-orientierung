import BackButton, { PrimaryButton } from '../components/Buttons'
import DeadlineBanner from '../components/DeadlineBanner'
import TrustNotice from '../components/TrustNotice'

const SECTIONS = [
  {
    title: 'New rent amount',
    explanation: 'The amount you are being asked to pay from now on.',
    tip: null,
  },
  {
    title: 'Effective from',
    explanation: 'When the new rent should apply. Usually from the next termination date.',
    tip: null,
  },
  {
    title: 'Reason given',
    explanation: 'The reason stated in the letter.',
    tip: 'General reasons without proof are often contestable.',
  },
  {
    title: 'Right to contest',
    explanation: 'Your right to object. This section says you can contest within 30 days and where to send it.',
    tip: 'Check that an address or deadline is clearly stated.',
  },
]

export default function ExplainPathScreen({
  deadlineEnd,
  receiptDate,
  onBack,
  onGoActions,
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <DeadlineBanner deadlineEnd={deadlineEnd} receiptDate={receiptDate} generic />

      <main className="flex-1 px-5 py-8">
        <div className="mx-auto w-full max-w-md">
          <BackButton onClick={onBack} />

          <h1 className="mb-3 text-2xl font-bold text-warm-900">What does it say exactly?</h1>
          <p className="mb-8 text-lg text-warm-800">
            How to read the letter, section by section.
          </p>

          <div className="mb-10 space-y-4">
            {SECTIONS.map((section) => (
              <article
                key={section.title}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-warm-200"
              >
                <h2 className="mb-2 text-lg font-bold text-warm-900">{section.title}</h2>
                <p className="text-base leading-relaxed text-warm-800">{section.explanation}</p>
                {section.tip && (
                  <p className="mt-3 rounded-xl bg-accent-light px-4 py-3 text-base font-medium text-accent">
                    Watch out: {section.tip}
                  </p>
                )}
              </article>
            ))}
          </div>

          <PrimaryButton onClick={onGoActions}>So what can I do now?</PrimaryButton>
        </div>
      </main>
      <TrustNotice />
    </div>
  )
}
