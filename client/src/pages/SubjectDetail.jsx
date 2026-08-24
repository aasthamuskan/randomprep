import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getQuestions } from '../services/api';
import DifficultyBadge from '../components/DifficultyBadge';

export default function SubjectDetail() {
  const { subjectName } = useParams();
  const navigate = useNavigate();

  const decodedSubject = decodeURIComponent(subjectName || 'C Language');

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubTopic, setSelectedSubTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [viewMode, setViewMode] = useState('study'); // 'study' | 'practice'
  const [expandedAnswers, setExpandedAnswers] = useState({});

  useEffect(() => {
    setLoading(true);
    getQuestions({ subject: decodedSubject })
      ? getQuestions({ subject: decodedSubject })
          .then((res) => {
            if (res?.questions) {
              setQuestions(res.questions);
            }
          })
          .catch((err) => console.error('Error loading questions:', err))
          .finally(() => setLoading(false))
      : setLoading(false);
  }, [decodedSubject]);

  // Extract unique subtopics
  const subTopics = ['All', ...Array.from(new Set(questions.map((q) => q.subTopic).filter(Boolean)))];

  // Filtered questions
  const filteredQuestions = questions.filter((q) => {
    if (selectedSubTopic !== 'All' && q.subTopic !== selectedSubTopic) return false;
    if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const toggleAnswer = (id) => {
    setExpandedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const startPracticeQuestion = (questionObj) => {
    navigate('/practice', {
      state: {
        presetQuestion: questionObj,
        subject: decodedSubject,
        subTopic: questionObj?.subTopic,
      },
    });
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8" style={{ background: '#04060F' }}>
      <div className="max-w-[1280px] mx-auto space-y-8">
        
        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/subjects')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors mb-2"
            >
              <span>← Back to All Subjects</span>
            </button>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {decodedSubject}
            </h1>
            <p className="text-sm text-white/60 mt-1">
              Showing {filteredQuestions.length} interview questions and concepts
            </p>
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('study')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'study'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              📖 Study & Read Mode
            </button>
            <button
              onClick={() =>
                navigate('/practice', {
                  state: { subject: decodedSubject, subTopic: selectedSubTopic !== 'All' ? selectedSubTopic : undefined },
                })
              }
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'practice'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              🎙️ AI Mock Interview
            </button>
          </div>
        </div>

        {/* Sub-Topics Tabs */}
        {subTopics.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {subTopics.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedSubTopic(st)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedSubTopic === st
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                    : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {st} {st === 'All' ? `(${questions.length})` : ''}
              </button>
            ))}
          </div>
        )}

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white/50">Difficulty:</span>
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
          
          <span className="text-xs font-mono text-white/40">
            {filteredQuestions.length} Questions Found
          </span>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10">
            <p className="text-base text-white/60">No questions match the selected filters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuestions.map((q, idx) => {
              const qId = q._id || idx;
              const isExpanded = !!expandedAnswers[qId];

              return (
                <motion.div
                  key={qId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="rounded-2xl p-6 border border-white/10 overflow-hidden"
                  style={{
                    background: 'rgba(15,20,35,0.7)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Top Bar: Question Number + Subtopic + Difficulty */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
                        Q{q.questionNumber || idx + 1}
                      </span>
                      <span className="text-xs font-medium text-purple-300/80 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                        {q.subTopic || 'Constructs'}
                      </span>
                    </div>
                    <DifficultyBadge difficulty={q.difficulty || 'Easy'} />
                  </div>

                  {/* Question Text */}
                  <h3 className="text-lg font-bold text-white leading-relaxed">
                    {q.question}
                  </h3>

                  {/* Description if present */}
                  {q.description && (
                    <p className="text-xs text-white/60 mt-1 leading-normal">
                      {q.description}
                    </p>
                  )}

                  {/* Code Snippet if present */}
                  {q.codeSnippet && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-white/10 bg-black/60 p-4 font-mono text-xs text-cyan-300">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10 text-[10px] text-white/40 uppercase tracking-wider">
                        <span>Code Example ({decodedSubject})</span>
                      </div>
                      <pre className="overflow-x-auto whitespace-pre leading-relaxed">
                        <code>{q.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                  {/* Key Concepts Tags */}
                  {q.expectedConcepts && q.expectedConcepts.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {q.expectedConcepts.map((concept, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-2.5 py-1 rounded-md text-[11px] font-mono text-white/60 bg-white/5 border border-white/5"
                        >
                          #{concept}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons Row */}
                  <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => toggleAnswer(qId)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all flex items-center gap-2"
                    >
                      <span>{isExpanded ? '🙈 Hide Ideal Answer' : '💡 View Ideal Answer & Solution'}</span>
                    </button>

                    <button
                      onClick={() => startPracticeQuestion(q)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all flex items-center gap-2"
                    >
                      <span>🎙️ Test Myself in AI Practice</span>
                    </button>
                  </div>

                  {/* Expandable Solution / Answer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-purple-500/20 bg-purple-950/20 rounded-xl p-4 border border-purple-500/30"
                      >
                        <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
                          Ideal Model Answer:
                        </h4>
                        <div className="text-sm text-white/90 leading-relaxed space-y-2 whitespace-pre-line">
                          {q.idealAnswer}
                        </div>

                        {q.hints && q.hints.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <span className="text-xs font-semibold text-amber-400">💡 Hint: </span>
                            <span className="text-xs text-white/70">{q.hints.join(' ')}</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
