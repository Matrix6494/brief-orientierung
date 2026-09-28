import BackButton from '../components/Buttons'
import TrustNotice from '../components/TrustNotice'

export default function FallbackScreen({ onBack }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 px-5 py-8">
        <div className="mx-auto w-full max-w-md">
          <BackButton onClick={onBack} />

          <h1 className="mb-4 text-2xl font-bold text-warm-900">
            We cannot identify this letter yet.
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-warm-800">
            That is okay. There are places that can help with many kinds of letters. They offer
            support for free and in plain language.
          </p>

          <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-warm-200">
            <h2 className="mb-2 text-lg font-bold text-warm-900">General support service</h2>
            <p className="mb-4 text-base text-warm-800">
              Contact a local advice centre. They can point you in the right direction. Many
              services are free or low cost.
            </p>
            <dl className="space-y-3 text-base">
              <div>
                <dt className="text-sm font-medium text-muted">Example</dt>
                <dd className="font-medium text-warm-900">Social counselling, Canton of Lucerne</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted">Phone</dt>
                <dd>
                  <a
                    href="tel:0800800800"
                    className="font-medium text-accent underline decoration-2 underline-offset-2"
                  >
                    0800 800 800
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted">Online</dt>
                <dd>
                  <a
                    href="https://www.ch.ch"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-accent underline decoration-2 underline-offset-2"
                  >
                    ch.ch: find help
                  </a>
                </dd>
              </div>
            </dl>
          </article>

          <p className="mt-8 text-center text-base text-warm-800">
            You are not alone. There is always someone who can listen.
          </p>
        </div>
      </main>
      <TrustNotice />
    </div>
  )
}
