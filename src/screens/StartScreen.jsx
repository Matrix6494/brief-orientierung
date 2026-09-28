import { PrimaryButton, TextLink } from '../components/Buttons'
import HeroIcon from '../components/HeroIcon'
import ProcessPreview from '../components/ProcessPreview'
import TrustNotice from '../components/TrustNotice'

export default function StartScreen({ onUpload, onChooseType }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex flex-1 flex-col px-5 py-8">
        <div className="mx-auto w-full max-w-md">
          <HeroIcon />

          <p className="mb-3 text-lg leading-relaxed text-warm-800">
            An official letter can feel unsettling. That is understandable.
          </p>
          <h1 className="mb-5 text-3xl font-bold leading-tight text-warm-900">
            We help you understand it.
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-warm-800">
            In plain language. Step by step. No legal jargon.
          </p>

          <div className="mb-10">
            <ProcessPreview />
          </div>

          <PrimaryButton onClick={onUpload}>Get started</PrimaryButton>
          <p className="mt-3 text-center text-sm text-muted">
            Take a photo or choose a letter type
          </p>
          <div className="mt-5 text-center">
            <TextLink onClick={onChooseType}>Choose letter type instead</TextLink>
          </div>

          <p className="mt-10 text-center text-base leading-relaxed text-warm-800">
            Many people feel unsure about official letters. You do not have to figure this out alone.
          </p>
        </div>
      </main>
      <TrustNotice />
    </div>
  )
}
