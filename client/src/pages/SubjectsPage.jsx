import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSubjectOverview } from '../services/api';

// Icon mapper for technical subjects
const SUBJECT_ICONS = {
  'C Language': { icon: '⚙️', color: 'from-blue-500 to-indigo-600', bgGlow: 'rgba(59,130,246,0.2)' },
  'C++': { icon: '🚀', color: 'from-cyan-500 to-blue-600', bgGlow: 'rgba(6,182,212,0.2)' },
  'Java': { icon: '☕', color: 'from-amber-500 to-orange-600', bgGlow: 'rgba(245,158,11,0.2)' },
  'Python': { icon: '🐍', color: 'from-emerald-500 to-teal-600', bgGlow: 'rgba(16,185,129,0.2)' },
  'DBMS': { icon: '🗄️', color: 'from-purple-500 to-pink-600', bgGlow: 'rgba(168,85,247,0.2)' },
  'SQL': { icon: '📊', color: 'from-violet-500 to-purple-600', bgGlow: 'rgba(139,92,246,0.2)' },
  'Operating Systems': { icon: '💻', color: 'from-pink-500 to-rose-600', bgGlow: 'rgba(236,72,153,0.2)' },
  'Computer Networks': { icon: '🌐', color: 'from-blue-400 to-cyan-500', bgGlow: 'rgba(56,189,248,0.2)' },
  'DSA': { icon: '🧩', color: 'from-indigo-500 to-purple-600', bgGlow: 'rgba(99,102,241,0.2)' },
  'System Design': { icon: '🏛️', color: 'from-fuchsia-500 to-pink-600', bgGlow: 'rgba(217,70,239,0.2)' },
  'OOP': { icon: '📦', color: 'from-teal-500 to-emerald-600', bgGlow: 'rgba(20,184,166,0.2)' },
};

const DEFAULT_ICON = { icon: '📚', color: 'from-purple-500 to-indigo-600', bgGlow: 'rgba(139,92,246,0.2)' };

export default function SubjectsPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getSubjectOverview()
      ? getSubjectOverview()
          .then((res) => {
            if (res?.subjects) {
              setSubjects(res.subjects);
            }
          })
          .catch((err) => console.error('Failed to load subjects overview:', err))
          .finally(() => setLoading(false))
      : setLoading(false);
  }, []);

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.subTopics?.some((st) => st.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8" style={{ background: '#04060F' }}>
      <div className="max-w-[1280px] mx-auto space-y-8">
        
        {/* Header Hero Banner */}
        <div className="relative rounded-3xl p-8 sm:p-10 overflow-hidden border border-purple-500/20"
          style={{
            background: 'linear-gradient(135deg, rgba(20,14,40,0.8) 0%, rgba(8,12,30,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-cyan-600/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide text-cyan-400 border border-cyan-500/30 bg-cyan-500/10 mb-4">
                <span>⚡ Subject-Wise Technical Curriculum</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Technical Interview Tracks
              </h1>
              <p className="mt-2 text-base text-white/60 max-w-2xl">
                Choose a specific subject to master theory questions, code constructs, and study detailed answers or practice mock interviews.
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-80">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search subject or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-11 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 text-sm transition-all"
                />
                <span className="absolute left-4 top-3.5 text-white/40">🔍</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          /* Subjects Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subj, index) => {
              const meta = SUBJECT_ICONS[subj.name] || DEFAULT_ICON;
              return (
                <motion.div
                  key={subj.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ y: -5, scale: 1.01 }}
                  onClick={() => navigate(`/subjects/${encodeURIComponent(subj.name)}`)}
                  className="group relative rounded-2xl p-6 cursor-pointer border border-white/10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  style={{
                    background: 'rgba(15,20,35,0.7)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  {/* Subtle Hover Ambient Glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${meta.bgGlow}, transparent 70%)` }}
                  />

                  <div>
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${meta.color} shadow-lg shadow-purple-500/20`}>
                        {meta.icon}
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
                        {subj.totalQuestions} Questions
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {subj.name}
                    </h2>
                    <p className="text-xs text-white/50 mt-1">
                      {subj.subTopics?.length || 1} Key Modules / Sub-topics
                    </p>

                    {/* Sub-topics Preview */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {subj.subTopics?.slice(0, 3).map((st) => (
                        <span
                          key={st.name}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-white/70 bg-white/5 border border-white/10"
                        >
                          {st.name} ({st.count})
                        </span>
                      ))}
                      {subj.subTopics?.length > 3 && (
                        <span className="px-2 py-1 rounded-lg text-[11px] font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20">
                          +{subj.subTopics.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action bar */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
                    <span>Explore Subject Tracks</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
