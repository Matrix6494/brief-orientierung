export default function HeroIcon() {
  return (
    <div
      className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-light"
      aria-hidden="true"
    >
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="8" y="10" width="32" height="28" rx="3" fill="#e8f0ee" stroke="#2d6a6a" strokeWidth="2" />
        <path d="M8 16h32" stroke="#2d6a6a" strokeWidth="2" />
        <path d="M14 24h20M14 30h14" stroke="#2d6a6a" strokeWidth="2" strokeLinecap="round" />
        <circle cx="36" cy="12" r="8" fill="#2d6a6a" />
        <path d="M33 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
