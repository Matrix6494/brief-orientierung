import { useRef } from 'react'
import BackButton, { PrimaryButton } from '../components/Buttons'
import TrustNotice from '../components/TrustNotice'
import { LETTER_TYPES } from '../utils/dates'

export default function CaptureScreen({ onBack, onPhotoSelected, onTypeSelected }) {
  const fileInputRef = useRef(null)

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const previewUrl = URL.createObjectURL(file)
    onPhotoSelected(previewUrl)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 px-5 py-8">
        <div className="mx-auto w-full max-w-md">
          <BackButton onClick={onBack} />

          <p className="mb-2 text-base text-warm-800">Good, you are on your way.</p>
          <h1 className="mb-3 text-2xl font-bold text-warm-900">How would you like to continue?</h1>
          <p className="mb-8 text-lg leading-relaxed text-warm-800">
            Take a photo of the letter, or choose the letter type if you prefer not to use a photo.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="sr-only"
            id="photo-input"
          />
          <PrimaryButton onClick={() => fileInputRef.current?.click()}>
            Take a photo or upload
          </PrimaryButton>

          <div className="my-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-warm-200" />
            <span className="text-sm text-muted">or</span>
            <div className="h-px flex-1 bg-warm-200" />
          </div>

          <h2 className="mb-4 text-xl font-semibold text-warm-900">
            What kind of letter did you receive?
          </h2>
          <ul className="space-y-3" role="list">
            {LETTER_TYPES.map((type) => (
              <li key={type.id}>
                <button
                  type="button"
                  onClick={() => onTypeSelected(type.id)}
                  className="flex min-h-14 w-full items-center rounded-2xl border-2 border-warm-200 bg-white px-5 py-4 text-left text-lg font-medium text-warm-900 transition-colors hover:border-accent/40 hover:bg-warm-50 active:scale-[0.98]"
                >
                  {type.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <TrustNotice />
    </div>
  )
}
