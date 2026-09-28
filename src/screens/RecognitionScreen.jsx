import { useState } from 'react'
import BackButton, { PrimaryButton, SecondaryButton } from '../components/Buttons'
import DeadlineBanner from '../components/DeadlineBanner'
import KeyMessages from '../components/KeyMessages'
import TrustNotice from '../components/TrustNotice'
import {
  downloadIcsEvent,
  formatDate,
  parseDateInput,
  saveDeadlineToStorage,
  toDateInputValue,
} from '../utils/dates'

export default function RecognitionScreen({
  photoPreview,
  receiptDate,
  deadlineEnd,
  onBack,
  onReceiptDateChange,
  onGoActions,
  onGoExplain,
}) {
  const [dateInput, setDateInput] = useState(
    receiptDate ? toDateInputValue(receiptDate) : '',
  )
  const [savedHint, setSavedHint] = useState(false)

  const handleDateChange = (event) => {
    const value = event.target.value
    setDateInput(value)
    const parsed = parseDateInput(value)
    onReceiptDateChange(parsed)
    setSavedHint(false)
  }

  const handleSaveDeadline = () => {
    if (!receiptDate || !deadlineEnd) return
    saveDeadlineToStorage(receiptDate, deadlineEnd)
    downloadIcsEvent({
      title: 'Deadline: contest rent increase',
      startDate: deadlineEnd,
      description: `Last day to contest the rent increase.\n30 days from receipt (${formatDate(receiptDate)}).`,
    })
    setSavedHint(true)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <DeadlineBanner deadlineEnd={deadlineEnd} receiptDate={receiptDate} generic />

      <main className="flex-1 px-5 py-8">
        <div className="mx-auto w-full max-w-md">
          <BackButton onClick={onBack} />

          {photoPreview && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-warm-200">
              <img
                src={photoPreview}
                alt="Preview of your letter, visible only on this device"
                className="max-h-40 w-full object-cover"
              />
            </div>
          )}

          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Detected
          </p>
          <h1 className="mb-6 text-3xl font-bold leading-tight text-warm-900">
            This is a rent increase notice.
          </h1>

          <KeyMessages deadlineEnd={deadlineEnd} />

          <label htmlFor="receipt-date" className="mb-2 block text-base font-medium text-warm-900">
            When did you receive the letter? (optional)
          </label>
          <input
            id="receipt-date"
            type="date"
            value={dateInput}
            onChange={handleDateChange}
            max={toDateInputValue(new Date())}
            className="mb-4 min-h-12 w-full rounded-2xl border-2 border-warm-200 bg-white px-4 text-base text-warm-900"
          />

          {receiptDate && deadlineEnd && (
            <SecondaryButton onClick={handleSaveDeadline} className="mb-2">
              Save deadline to calendar
            </SecondaryButton>
          )}
          {savedHint && (
            <p className="mb-6 text-sm text-warm-800" role="status">
              Deadline saved. Calendar file downloaded.
            </p>
          )}

          <div className="mt-8 space-y-4">
            <PrimaryButton variant="accent" onClick={onGoActions}>What can I do?</PrimaryButton>
            <SecondaryButton onClick={onGoExplain}>What does it say exactly?</SecondaryButton>
          </div>
        </div>
      </main>
      <TrustNotice />
    </div>
  )
}
