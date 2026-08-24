import DifficultyBadge from './DifficultyBadge';

function ScoreRing({ score }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#22C55E' : score >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#1C1C1C" strokeWidth="6" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-semibold tabular-nums" style={{ color }}>{score}</span>
        <span className="text-2xs text-ink-muted">/ 100</span>
      </div>
    </div>
  );
}

export default function EvaluationResult({ result, question, onPracticeAgain }) {
  if (!result) return null;
  const { score, feedback, strengths, improvements, matchedConcepts, totalConcepts, timeTaken, idealAnswer } = result;

  const formatTime = (s) => {
    if (!s && s !== 0) return '0s';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return (
    <div className="animate-slide-up space-y-6 max-w-content mx-auto">
      {/* Header */}
      <div className="border-b border-line pb-5">
        <div className="label mb-2">Interview Complete</div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-ink-secondary bg-surface px-2 py-0.5 rounded border border-line">
                {question?.category}
              </span>
              <DifficultyBadge difficulty={question?.difficulty} />
            </div>
            <p className="text-base text-ink leading-snug">{question?.question}</p>
          </div>
          <ScoreRing score={score} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Score', value: `${score}/100` },
          { label: 'Time Taken', value: formatTime(timeTaken) },
          { label: 'Concepts Hit', value: `${matchedConcepts?.length ?? 0}/${totalConcepts ?? 0}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface rounded-md p-4 border border-line">
            <div className="label mb-1.5">{label}</div>
            <div className="text-lg font-semibold text-ink">{value}</div>
          </div>
        ))}
      </div>

      {/* AI Feedback */}
      {feedback && (
        <div>
          <div className="label mb-2">Overall Feedback</div>
          <p className="text-sm text-ink-secondary leading-relaxed">{feedback}</p>
        </div>
      )}

      {/* Strengths */}
      {strengths && (
        <div className="bg-easy/5 border border-easy/20 rounded-md px-4 py-3">
          <div className="label text-easy/80 mb-1">What You Did Well</div>
          <p className="text-sm text-ink-secondary leading-relaxed">{strengths}</p>
        </div>
      )}

      {/* Areas to improve */}
      {improvements && (
        <div className="bg-medium/5 border border-medium/20 rounded-md px-4 py-3">
          <div className="label text-medium/80 mb-1">Areas to Improve</div>
          <p className="text-sm text-ink-secondary leading-relaxed">{improvements}</p>
        </div>
      )}

      {/* Matched concepts */}
      {matchedConcepts?.length > 0 && (
        <div>
          <div className="label mb-2">Concepts Covered</div>
          <div className="flex flex-wrap gap-1.5">
            {matchedConcepts.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-easy/5 border border-easy/20 text-easy text-xs font-mono">
                ✓ {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ideal answer */}
      {idealAnswer && (
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer py-3 border-t border-line text-sm text-ink-secondary hover:text-ink transition-colors list-none">
            <span className="label">Model Answer</span>
            <svg className="w-4 h-4 text-ink-muted group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="text-sm text-ink-secondary leading-relaxed mt-3 pb-3 border-b border-line">{idealAnswer}</p>
        </details>
      )}

      {/* CTA */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onPracticeAgain}
          className="px-5 py-2.5 bg-accent hover:bg-accent-dim text-white text-sm font-medium rounded transition-colors"
        >
          Practice Another
        </button>
      </div>
    </div>
  );
}
