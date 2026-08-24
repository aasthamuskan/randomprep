const COLORS = {
  Easy: 'text-easy border-easy/30 bg-easy/5',
  Medium: 'text-medium border-medium/30 bg-medium/5',
  Hard: 'text-hard border-hard/30 bg-hard/5',
};

export default function DifficultyBadge({ difficulty, size = 'sm' }) {
  if (!difficulty) return null;
  const cls = COLORS[difficulty] || 'text-ink-secondary border-line bg-surface';
  const pad = size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center rounded border font-mono font-medium ${pad} ${cls}`}>
      {difficulty}
    </span>
  );
}
