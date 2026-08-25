import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getRandomQuestion } from '../services/api';
import MetaverseBackground from '../components/MetaverseBackground';

const INTERVIEW_TYPES = ['Technical', 'Behavioral', 'HR', 'Managerial'];
const COMPANY_TYPES   = ['Product', 'Service', 'Startup', 'MNC', 'Big Tech'];

const ROLES_BY_TYPE = {
  Technical:   ['SDE', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'MERN Developer', 'DevOps Engineer', 'Data Engineer', 'ML Engineer'],
  Behavioral:  ['SDE', 'Team Lead', 'Engineering Manager', 'Product Manager'],
  HR:          ['SDE', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer'],
  Managerial:  ['Engineering Manager', 'Tech Lead', 'VP Engineering', 'Director of Engineering'],
};

const FOCUS_BY_ROLE = {
  'SDE':                  ['DSA', 'OOP', 'System Design', 'DBMS/SQL', 'Operating Systems', 'Computer Networks'],
  'Frontend Developer':   ['JavaScript', 'React', 'HTML/CSS', 'Web Development', 'DSA'],
  'Backend Developer':    ['Node.js', 'DBMS/SQL', 'System Design', 'OOP', 'DSA', 'Computer Networks'],
  'Full Stack Developer': ['JavaScript', 'React', 'Node.js', 'DBMS/SQL', 'System Design', 'DSA'],
  'MERN Developer':       ['JavaScript', 'React', 'Node.js', 'DBMS/SQL', 'Web Development', 'DSA'],
  'DevOps Engineer':      ['DevOps', 'Computer Networks', 'Operating Systems', 'System Design'],
  'Data Engineer':        ['DBMS/SQL', 'AI/ML', 'System Design', 'DSA', 'OOP'],
  'ML Engineer':          ['AI/ML', 'DSA', 'OOP', 'System Design', 'DBMS/SQL'],
  'Team Lead':            ['System Design', 'OOP', 'DSA', 'DevOps'],
  'Engineering Manager':  ['System Design', 'DevOps', 'OOP'],
  'Product Manager':      ['System Design', 'Web Development'],
  'Tech Lead':            ['System Design', 'DSA', 'OOP', 'DevOps'],
  'VP Engineering':       ['System Design', 'DevOps'],
  'Director of Engineering': ['System Design', 'DevOps'],
};

const BEHAVIORAL_FOCUS = ['Leadership', 'Conflict Resolution', 'Teamwork', 'Problem Solving', 'Communication'];
const HR_FOCUS         = ['Career Goals', 'Strengths & Weaknesses', 'Salary', 'Culture Fit', 'Work Style'];
const MANAGERIAL_FOCUS = ['Team Management', 'Decision Making', 'Conflict Resolution', 'Delivery & Execution'];
const DIFFICULTIES     = ['Easy', 'Medium', 'Hard', 'Mixed'];

function Chip({ label, active, onClick, color = '#8B5CF6' }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.97 }}
      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
      style={{
        background: active ? `${color}25` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${active ? color + '60' : 'rgba(255,255,255,0.08)'}`,
        color: active ? '#fff' : 'rgba(255,255,255,0.45)',
        boxShadow: active ? `0 0 16px ${color}30` : 'none',
      }}
    >
      {label}
    </motion.button>
  );
}

function Step({ num, label, children }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-purple-400/50">STEP {String(num).padStart(2, '0')}</span>
        <span className="text-xs font-medium text-white/50 uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function QuestionCard({ question, onStart, onAnother }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{
        background: 'rgba(139,92,246,0.06)',
        border: '1px solid rgba(139,92,246,0.25)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.1)',
      }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2 py-0.5 rounded text-2xs font-mono" style={{ background: 'rgba(139,92,246,0.2)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.3)' }}>
          {question.category}
        </span>
        <span className="px-2 py-0.5 rounded text-2xs font-mono" style={{
          background: question.difficulty === 'Easy' ? 'rgba(16,185,129,0.15)' : question.difficulty === 'Hard' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
          color: question.difficulty === 'Easy' ? '#34D399' : question.difficulty === 'Hard' ? '#F87171' : '#FCD34D',
          border: `1px solid ${question.difficulty === 'Easy' ? 'rgba(16,185,129,0.3)' : question.difficulty === 'Hard' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
        }}>
          {question.difficulty}
        </span>
      </div>

      <p className="text-white font-medium text-base leading-relaxed">{question.question}</p>

      {question.hints?.[0] && (
        <p className="text-xs text-purple-300/50 italic border-l-2 border-purple-500/20 pl-3">{question.hints[0]}</p>
      )}

      <div className="flex gap-2 pt-1">
        <motion.button
          onClick={onStart}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.7), rgba(6,182,212,0.7))',
            border: '1px solid rgba(139,92,246,0.4)',
            boxShadow: '0 0 20px rgba(139,92,246,0.25)',
          }}
        >
          Start Practice →
        </motion.button>
        <motion.button
          onClick={onAnother}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/80 transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          New Question
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const [type, setType]         = useState('Technical');
  const [company, setCompany]   = useState('Product');
  const [role, setRole]         = useState('SDE');
  const [focus, setFocus]       = useState('DSA');
  const [difficulty, setDiff]   = useState('Medium');
  const [question, setQuestion] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [mouse, setMouse]       = useState({ x: 0, y: 0 });

  const roles        = ROLES_BY_TYPE[type] || [];
  const currentRole  = roles.includes(role) ? role : roles[0];
  const focusOptions = type === 'Technical' ? (FOCUS_BY_ROLE[currentRole] || []) : type === 'Behavioral' ? BEHAVIORAL_FOCUS : type === 'HR' ? HR_FOCUS : MANAGERIAL_FOCUS;
  const currentFocus = focusOptions.includes(focus) ? focus : focusOptions[0];

  const handleSetType = (t) => { setType(t); setQuestion(null); };
  const handleSetRole = (r) => { setRole(r); setQuestion(null); };

  const fetchQuestion = useCallback(async () => {
    setLoading(true); setError(''); setQuestion(null);
    try {
      const params = {
        category: currentFocus,
        subTopic: currentFocus,
        difficulty: difficulty === 'Mixed' ? undefined : difficulty,
        excludeId: question?._id || question?.id,
      };
      const data = await getRandomQuestion(params);
      setQuestion(data.question);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load. Is the server running?');
    } finally { setLoading(false); }
  }, [type, currentFocus, difficulty, question]);

  const handleStart = () => {
    if (!question) return;
    navigate('/practice', { state: { question, interviewType: type, role: currentRole, company } });
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]" style={{ background: '#04060F' }}>
      <MetaverseBackground mouseX={mouse.x} mouseY={mouse.y} />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-14">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-3 tracking-tight"
            style={{ textShadow: '0 0 60px rgba(139,92,246,0.3)' }}>
            Prepare for your{' '}
            <span style={{ background: 'linear-gradient(135deg, #A78BFA, #67E8F9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              next interview
            </span>
          </h1>
          <p className="text-white/40 text-base max-w-lg mx-auto">
            AI-generated theory questions tailored to your role and topic. Get real-time evaluation after every answer.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
          {/* Setup steps */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-7"
          >
            {[
              { label: 'Interview Type', step: 1, options: INTERVIEW_TYPES, selected: type, onSelect: handleSetType, color: '#8B5CF6' },
              { label: 'Company Type',   step: 2, options: COMPANY_TYPES,   selected: company, onSelect: setCompany, color: '#06B6D4' },
              { label: 'Target Role',    step: 3, options: roles,            selected: currentRole, onSelect: handleSetRole, color: '#3B82F6' },
              { label: type === 'Technical' ? 'Focus Area' : 'Topic', step: 4, options: focusOptions, selected: currentFocus, onSelect: setFocus, color: '#A855F7' },
              { label: 'Difficulty',     step: 5, options: DIFFICULTIES,    selected: difficulty, onSelect: setDiff, color: '#F59E0B' },
            ].map(({ label, step, options, selected, onSelect, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="flex flex-col gap-3 pb-7 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <Step num={step} label={label}>
                  {options.map((opt) => (
                    <Chip key={opt} label={opt} active={selected === opt} onClick={() => onSelect(opt)} color={color} />
                  ))}
                </Step>
              </motion.div>
            ))}

            {error && (
              <p className="text-sm text-red-400 px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </p>
            )}

            <motion.button
              onClick={fetchQuestion}
              disabled={loading}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl font-semibold text-base text-white transition-all"
              style={{
                background: loading ? 'rgba(139,92,246,0.2)' : 'linear-gradient(135deg, rgba(139,92,246,0.8), rgba(6,182,212,0.7))',
                border: '1px solid rgba(139,92,246,0.4)',
                boxShadow: loading ? 'none' : '0 0 30px rgba(139,92,246,0.25)',
              }}
            >
              {loading ? 'AI Generating Question…' : 'Generate Question →'}
            </motion.button>
          </motion.div>

          {/* Question card / placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-20 h-fit"
          >
            {loading && (
              <div className="flex flex-col items-center justify-center gap-4 py-16 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  className="w-10 h-10 rounded-full"
                  style={{ border: '2px solid rgba(139,92,246,0.2)', borderTopColor: '#8B5CF6' }}
                />
                <p className="text-xs font-mono text-purple-400">AI is thinking…</p>
              </div>
            )}

            {!loading && question && (
              <QuestionCard question={question} onStart={handleStart} onAnother={fetchQuestion} />
            )}

            {!loading && !question && (
              <div className="flex flex-col items-center justify-center gap-3 py-20 rounded-2xl min-h-[300px]"
                style={{ background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(139,92,246,0.2)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  🤖
                </div>
                <p className="text-sm text-white/25 text-center max-w-[200px]">
                  Your AI-generated question will appear here
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
