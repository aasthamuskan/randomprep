import { useState, useEffect, useCallback } from 'react';
import { getHistory } from '../services/api';
import DifficultyBadge from '../components/DifficultyBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['All', 'DSA', 'JavaScript', 'React', 'Node.js', 'HTML/CSS', 'OOP', 'DBMS/SQL', 'Operating Systems', 'Computer Networks', 'DevOps', 'System Design', 'AI/ML', 'Web Development', 'C++'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

function ScoreChip({ score }) {
  const color = score >= 70 ? 'text-easy' : score >= 40 ? 'text-medium' : 'text-hard';
  return <span className={`font-mono font-semibold text-sm ${color}`}>{score}</span>;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(s) {
  if (!s && s !== 0) return '—';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getHistory({ page, limit: 15 });
      setHistory(data.history);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch {
      setError('Failed to load history. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  // Client-side filter
  const filtered = history.filter((h) => {
    if (filterCategory !== 'All' && h.category !== filterCategory) return false;
    if (filterDifficulty !== 'All' && h.difficulty !== filterDifficulty) return false;
    return true;
  });

  return (
    <div className="max-w-page mx-auto px-6 py-10 page-enter">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-5 border-b border-line">
        <div>
          <h1 className="text-xl font-semibold text-ink mb-0.5">Interview History</h1>
          <p className="text-sm text-ink-muted">{total} session{total !== 1 ? 's' : ''} recorded</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <span className="label">Technology</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-surface border border-line text-ink text-sm rounded px-3 py-1.5 focus:outline-none focus:border-accent"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="label">Difficulty</span>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="bg-surface border border-line text-ink text-sm rounded px-3 py-1.5 focus:outline-none focus:border-accent"
          >
            {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <LoadingSpinner label="Loading history..." />
        </div>
      ) : error ? (
        <div className="py-10 text-center">
          <p className="text-sm text-hard">{error}</p>
          <button onClick={load} className="mt-4 px-4 py-2 text-sm bg-surface border border-line rounded text-ink-secondary hover:text-ink">
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-line rounded-lg">
          <p className="text-sm text-ink-muted">No sessions found. Start practicing to see your history here.</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="border border-line rounded-lg overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_120px_80px_70px_80px_100px] gap-4 px-5 py-2.5 bg-surface border-b border-line">
              {['Question', 'Technology', 'Difficulty', 'Score', 'Time', 'Date'].map((h) => (
                <span key={h} className="label text-left">{h}</span>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((session) => (
              <div key={session.id}>
                <button
                  onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                  className="w-full grid grid-cols-[1fr_120px_80px_70px_80px_100px] gap-4 px-5 py-3.5
                             border-b border-line last:border-0 hover:bg-surface transition-colors text-left"
                >
                  <span className="text-sm text-ink truncate pr-2">{session.question}</span>
                  <span className="text-xs font-mono text-ink-secondary truncate">{session.category}</span>
                  <span><DifficultyBadge difficulty={session.difficulty} /></span>
                  <ScoreChip score={session.score} />
                  <span className="text-xs font-mono text-ink-secondary">{formatTime(session.timeTaken)}</span>
                  <span className="text-xs text-ink-muted">{formatDate(session.createdAt)}</span>
                </button>

                {/* Expanded row */}
                {expandedId === session.id && (
                  <div className="px-5 py-4 bg-surface border-b border-line animate-fade-in">
                    <div className="max-w-2xl space-y-3">
                      <div>
                        <p className="label mb-1.5">Your Answer</p>
                        <p className="text-sm text-ink-secondary leading-relaxed">{session.answer}</p>
                      </div>
                      {session.feedback && (
                        <div>
                          <p className="label mb-1.5">Feedback</p>
                          <p className="text-sm text-ink-secondary leading-relaxed">{session.feedback}</p>
                        </div>
                      )}
                      {session.matchedConcepts?.length > 0 && (
                        <div>
                          <p className="label mb-1.5">Concepts Covered</p>
                          <div className="flex flex-wrap gap-1.5">
                            {session.matchedConcepts.map((c) => (
                              <span key={c} className="px-2 py-0.5 rounded bg-easy/5 border border-easy/20 text-easy text-xs font-mono">{c}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5">
              <span className="text-xs text-ink-muted">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-line rounded bg-surface text-ink-secondary hover:text-ink disabled:opacity-40"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-line rounded bg-surface text-ink-secondary hover:text-ink disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
