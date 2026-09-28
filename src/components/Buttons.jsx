export default function BackButton({ onClick, label = 'Back' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-6 flex min-h-12 items-center gap-2 text-base font-medium text-warm-800 underline-offset-4 hover:underline focus-visible:outline-accent"
      aria-label={label}
    >
      <span aria-hidden="true">←</span>
      {label}
    </button>
  )
}

export function PrimaryButton({ children, onClick, type = 'button', className = '', variant = 'primary' }) {
  const styles =
    variant === 'accent'
      ? 'bg-accent hover:bg-accent-hover'
      : 'bg-primary hover:bg-primary-hover'

  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex min-h-14 w-full items-center justify-center rounded-2xl px-6 py-4 text-lg font-semibold text-white transition-colors active:scale-[0.98] ${styles} ${className}`}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({ children, onClick, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-warm-800/20 bg-white px-6 py-4 text-lg font-semibold text-warm-900 transition-colors hover:border-warm-800/40 active:scale-[0.98] ${className}`}
    >
      {children}
    </button>
  )
}

export function TextLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-12 text-base text-warm-800 underline decoration-2 underline-offset-4 hover:text-warm-900"
    >
      {children}
    </button>
  )
}
