import { useState, useEffect } from 'react';
import { getStats, getHistory } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function ProgressBar({ pct, color = 'bg-accent' }) {
  return (
    <div className="w-full h-1.5 bg-surface-overlay rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="border border-line rounded-lg p-5 bg-surface">
      <p className="label mb-2">{label}</p>
      <p className="text-2xl font-semibold text-ink">{value}</p>
      {sub && <p className="text-xs text-ink-muted mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Progress() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, historyData] = await Promise.all([
          getStats(),
          getHistory({ page: 1, limit: 20 }),
        ]);
        setStats(statsData.stats);
        setRecent(historyData.history);
      } catch {
        setError('Failed to load progress. Is the server running?');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading progress..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-content mx-auto px-6 py-20 text-center">
        <p className="text-sm text-hard">{error}</p>
      </div>
    );
  }

  // Build category breakdown from byCategory
  const byCategory = stats?.byCategory || [];

  // Readiness = average score / 100
  const readinessPct = stats?.averageScore || 0;
  const readinessColor =
    readinessPct >= 70 ? 'text-easy' : readinessPct >= 40 ? 'text-medium' : 'text-hard';

  // Weak areas = categories with avgScore < 55
  const weakAreas = byCategory
    .filter((c) => c.avgScore < 55)
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 4);

  // Recent performance (last 10)
  const recentPerf = recent.slice(0, 10);

  const barColor = (score) =>
    score >= 70 ? 'bg-easy' : score >= 40 ? 'bg-medium' : 'bg-hard';

  return (
    <div className="max-w-wide mx-auto px-6 py-10 page-enter">
      {/* Header */}
      <div className="mb-8 pb-5 border-b border-line">
        <h1 className="text-xl font-semibold text-ink mb-0.5">Progress</h1>
        <p className="text-sm text-ink-muted">Your interview readiness at a glance</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Sessions Practiced" value={stats?.total ?? 0} />
        <StatCard
          label="Average Score"
          value={<span className={readinessColor}>{stats?.averageScore ?? 0}</span>}
          sub="out of 100"
        />
        <StatCard
          label="Categories Covered"
          value={byCategory.length}
          sub={`of 14 total categories`}
        />
      </div>

      {/* Overall readiness */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-ink">Overall Interview Readiness</p>
          <span className={`text-sm font-mono font-semibold ${readinessColor}`}>{readinessPct}%</span>
        </div>
        <ProgressBar pct={readinessPct} color={
          readinessPct >= 70 ? 'bg-easy' : readinessPct >= 40 ? 'bg-medium' : 'bg-hard'
        } />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category breakdown */}
        <div>
          <p className="label mb-4">Category Breakdown</p>
          {byCategory.length === 0 ? (
            <p className="text-sm text-ink-muted">No data yet. Complete practice sessions to see breakdown.</p>
          ) : (
            <div className="space-y-4">
              {byCategory
                .sort((a, b) => b.avgScore - a.avgScore)
                .map((cat) => {
                  const pct = Math.round(cat.avgScore);
                  return (
                    <div key={cat._id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-ink">{cat._id}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-ink-muted">{cat.count} session{cat.count !== 1 ? 's' : ''}</span>
                          <span className={`text-xs font-mono font-medium ${barColor(pct) === 'bg-easy' ? 'text-easy' : barColor(pct) === 'bg-medium' ? 'text-medium' : 'text-hard'}`}>
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <ProgressBar pct={pct} color={barColor(pct)} />
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-8">
          {/* Weak areas */}
          {weakAreas.length > 0 && (
            <div>
              <p className="label mb-3">Weak Areas — Focus Here</p>
              <div className="space-y-2">
                {weakAreas.map((cat) => (
                  <div key={cat._id} className="flex items-center justify-between px-4 py-3 bg-surface border border-line rounded-md">
                    <span className="text-sm text-ink">{cat._id}</span>
                    <span className="text-xs font-mono text-hard">{Math.round(cat.avgScore)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent performance */}
          <div>
            <p className="label mb-3">Recent Performance</p>
            {recentPerf.length === 0 ? (
              <p className="text-sm text-ink-muted">No sessions yet.</p>
            ) : (
              <div className="space-y-2">
                {recentPerf.map((s) => (
                  <div key={s.id} className="flex items-center gap-3">
                    {/* Mini bar */}
                    <div className="w-24 h-1.5 bg-surface-overlay rounded-full overflow-hidden flex-shrink-0">
                      <div
                        className={`h-full rounded-full ${barColor(s.score)}`}
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono w-7 flex-shrink-0 ${barColor(s.score) === 'bg-easy' ? 'text-easy' : barColor(s.score) === 'bg-medium' ? 'text-medium' : 'text-hard'}`}>
                      {s.score}
                    </span>
                    <span className="text-xs text-ink-secondary truncate">{s.question}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
