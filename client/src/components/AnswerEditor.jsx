export default function AnswerEditor({ value, onChange, placeholder, rows = 12 }) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between mb-1">
        <span className="label">Your Answer</span>
        <span className="text-2xs font-mono text-ink-muted">
          {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} chars
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Type your answer here. Explain your reasoning clearly — as you would in a real interview...'}
        rows={rows}
        className="w-full bg-surface rounded-md border border-line text-ink text-sm font-sans
                   placeholder:text-ink-muted resize-y p-4 leading-relaxed
                   focus:outline-none focus:border-accent transition-colors duration-150"
        spellCheck="false"
      />
      {wordCount > 0 && wordCount < 20 && (
        <p className="text-2xs text-ink-muted mt-1">
          Tip: Aim for at least 50 words to demonstrate thorough understanding.
        </p>
      )}
    </div>
  );
}
