import BackButton, { SecondaryButton } from '../components/Buttons'
import DeadlineBanner from '../components/DeadlineBanner'
import TrustNotice from '../components/TrustNotice'

const STEPS = [
  {
    number: 1,
    title: 'Get it reviewed',
    text: 'A rent increase must be justified. General reasons like rising costs alone are often not enough.',
  },
  {
    number: 2,
    title: 'Watch the deadline',
    text: 'You have 30 days from receipt to contest the increase. It costs nothing.',
  },
  {
    number: 3,
    title: 'Get help',
    text: 'Contact the tenants\' association or the tenancy mediation authority in Canton Lucerne. Both can help you for free.',
  },
]

const CONTACTS = [
  {
    name: 'Tenants\' Association',
    subtitle: 'Lucerne region',
    address: 'Pilatusstrasse 29, 6003 Lucerne',
    phone: '041 210 33 44',
    link: 'https://www.schweizerischer-mieterschutz.ch/',
    linkLabel: 'schweizerischer-mieterschutz.ch',
  },
  {
    name: 'Tenancy Mediation Authority',
    subtitle: 'Canton of Lucerne',
    address: 'Murbacherstrasse 31, 6002 Lucerne',
    phone: '041 228 50 50',
    link: 'https://gerichte.lu.ch/organisation/schlichtungsbehoerden/miete_pacht',
    linkLabel: 'gerichte.lu.ch',
  },
]

function ContactCard({ contact }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-warm-200">
      <h3 className="text-lg font-bold text-warm-900">{contact.name}</h3>
      <p className="mb-4 text-sm text-muted">{contact.subtitle}</p>
      <dl className="space-y-3 text-base">
        <div>
          <dt className="text-sm font-medium text-muted">Address</dt>
          <dd className="text-warm-900">{contact.address}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted">Phone</dt>
          <dd>
            <a
              href={`tel:${contact.phone.replace(/\s/g, '')}`}
              className="font-medium text-accent underline decoration-2 underline-offset-2"
            >
              {contact.phone}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted">Online</dt>
          <dd>
            <a
              href={contact.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent underline decoration-2 underline-offset-2"
            >
              {contact.linkLabel}
            </a>
          </dd>
        </div>
      </dl>
    </article>
  )
}

export default function ActionPathScreen({ deadlineEnd, receiptDate, onBack, onGoExplain }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <DeadlineBanner deadlineEnd={deadlineEnd} receiptDate={receiptDate} generic />

      <main className="flex-1 px-5 py-8">
        <div className="mx-auto w-full max-w-md">
          <BackButton onClick={onBack} />

          <h1 className="mb-8 text-2xl font-bold text-warm-900">What can I do?</h1>

          <ol className="mb-10 space-y-6">
            {STEPS.map((step) => (
              <li key={step.number} className="flex gap-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-white"
                  aria-hidden="true"
                >
                  {step.number}
                </span>
                <div>
                  <h2 className="mb-1 text-lg font-semibold text-warm-900">{step.title}</h2>
                  <p className="text-base leading-relaxed text-warm-800">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <h2 className="mb-4 text-xl font-semibold text-warm-900">Where to get help</h2>
          <div className="mb-10 space-y-4">
            {CONTACTS.map((contact) => (
              <ContactCard key={contact.name} contact={contact} />
            ))}
          </div>

          <div className="mb-8 rounded-2xl bg-warm-100 p-5 text-center">
            <p className="text-lg font-medium leading-relaxed text-warm-900">
              You are not alone with this, and you do not have to sign anything right away.
            </p>
          </div>

          <SecondaryButton onClick={onGoExplain}>What does it say exactly?</SecondaryButton>
        </div>
      </main>
      <TrustNotice />
    </div>
  )
}
