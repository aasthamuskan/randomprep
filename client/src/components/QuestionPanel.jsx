import { useRef } from 'react';
import { motion } from 'framer-motion';

// 3D tilt hook
function useTilt(strength = 6) {
  const ref = useRef(null);

  const onMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    el.style.transform = `perspective(800px) rotateX(${-y * strength}deg) rotateY(${x * strength}deg) translateZ(4px)`;
  };

  const onMouseLeave = () => {
    if (ref.current)
      ref.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  };

  return { ref, onMouseMove, onMouseLeave };
}

// Animated checkmark circle
function ConceptCheck({ concept, index }) {
  return (
    <motion.div
      key={concept}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 + index * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-2.5 group"
    >
      {/* Check icon */}
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110"
        style={{
          background: 'rgba(139,92,246,0.15)',
          border: '1px solid rgba(139,92,246,0.4)',
          boxShadow: '0 0 8px rgba(139,92,246,0.2)',
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <motion.path
            d="M2 5l2.5 2.5L8 3"
            stroke="#A78BFA"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4 + index * 0.07, duration: 0.4 }}
          />
        </svg>
      </div>
      <span className="text-sm text-white/65 group-hover:text-white/85 transition-colors duration-200 leading-snug">
        {concept}
      </span>
    </motion.div>
  );
}

export default function QuestionPanel({ question }) {
  const tilt = useTilt(4);

  if (!question) return null;
  const concepts = question.expectedConcepts || [];

  const difficultyStyle = {
    Easy: { bg: 'rgba(16,185,129,0.12)', color: '#34D399', border: 'rgba(16,185,129,0.3)' },
    Hard: { bg: 'rgba(239,68,68,0.12)',  color: '#F87171', border: 'rgba(239,68,68,0.3)' },
    Medium: { bg: 'rgba(245,158,11,0.12)', color: '#FCD34D', border: 'rgba(245,158,11,0.3)' },
  }[question.difficulty] || { bg: 'rgba(245,158,11,0.12)', color: '#FCD34D', border: 'rgba(245,158,11,0.3)' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="relative rounded-2xl p-6 flex flex-col gap-5 animate-float"
      style={{
        background: 'rgba(10,12,30,0.65)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(139,92,246,0.22)',
        boxShadow: '0 24px 70px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(139,92,246,0.04)',
        animationDelay: '0.5s',
        transition: 'transform 0.15s ease-out',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Corner decorations */}
      <div className="absolute top-3 left-3 w-4 h-4 pointer-events-none"
        style={{ borderTop: '1.5px solid rgba(139,92,246,0.55)', borderLeft: '1.5px solid rgba(139,92,246,0.55)' }} />
      <div className="absolute top-3 right-3 w-4 h-4 pointer-events-none"
        style={{ borderTop: '1.5px solid rgba(6,182,212,0.4)', borderRight: '1.5px solid rgba(6,182,212,0.4)' }} />
      <div className="absolute bottom-3 left-3 w-4 h-4 pointer-events-none"
        style={{ borderBottom: '1.5px solid rgba(6,182,212,0.4)', borderLeft: '1.5px solid rgba(6,182,212,0.4)' }} />
      <div className="absolute bottom-3 right-3 w-4 h-4 pointer-events-none"
        style={{ borderBottom: '1.5px solid rgba(139,92,246,0.55)', borderRight: '1.5px solid rgba(139,92,246,0.55)' }} />

      {/* Holographic grid overlay */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-40"
        style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Header badges */}
      <div className="flex items-center gap-2 flex-wrap relative">
        {/* QUESTION badge with shimmer */}
        <div
          className="badge-shimmer px-2.5 py-1 rounded-md text-2xs font-mono font-bold tracking-widest uppercase"
          style={{
            background: 'rgba(139,92,246,0.18)',
            color: '#C4B5FD',
            border: '1px solid rgba(139,92,246,0.4)',
            boxShadow: '0 0 12px rgba(139,92,246,0.2)',
          }}
        >
          Question
        </div>
        <div
          className="px-2 py-0.5 rounded-md text-2xs font-mono"
          style={{ background: 'rgba(6,182,212,0.1)', color: '#67E8F9', border: '1px solid rgba(6,182,212,0.25)' }}
        >
          {question.category}
        </div>
        <div
          className="px-2 py-0.5 rounded-md text-2xs font-mono"
          style={{ background: difficultyStyle.bg, color: difficultyStyle.color, border: `1px solid ${difficultyStyle.border}` }}
        >
          {question.difficulty}
        </div>
      </div>

      {/* Question text */}
      <p className="text-white font-medium leading-relaxed text-base relative" style={{ letterSpacing: '-0.01em' }}>
        {question.question}
      </p>

      {/* Hint */}
      {question.hints?.[0] && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs italic leading-relaxed relative"
          style={{
            color: 'rgba(167,139,250,0.6)',
            borderLeft: '2px solid rgba(139,92,246,0.4)',
            paddingLeft: '12px',
          }}
        >
          {question.hints[0]}
        </motion.p>
      )}

      {/* Concepts checklist */}
      {concepts.length > 0 && (
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.3), transparent)' }} />
            <p className="text-2xs font-mono font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Interviewer Wants to Hear
            </p>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.3))' }} />
          </div>
          <div className="flex flex-col gap-2.5">
            {concepts.map((concept, i) => (
              <ConceptCheck key={concept} concept={concept} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-8 right-8 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), rgba(6,182,212,0.3), transparent)' }} />
    </motion.div>
  );
}
