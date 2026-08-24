export default function LoadingSpinner({ size = 'md', label }) {
  const dim = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg className={`animate-spin text-accent ${dim}`} viewBox="0 0 24 24" fill="none">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
        <path className="opacity-80" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {label && <p className="text-sm text-ink-muted">{label}</p>}
    </div>
  );
}
