import { motion } from 'framer-motion';

const STAR = [
  { letter: 'S', label: 'Situation', desc: 'Set the context and background', color: '#8B5CF6', glow: 'rgba(139,92,246,0.4)' },
  { letter: 'T', label: 'Task',      desc: 'Describe your responsibility',   color: '#3B82F6', glow: 'rgba(59,130,246,0.4)' },
  { letter: 'A', label: 'Action',    desc: 'Explain the steps you took',     color: '#06B6D4', glow: 'rgba(6,182,212,0.4)' },
  { letter: 'R', label: 'Result',    desc: 'Share the measurable outcome',   color: '#10B981', glow: 'rgba(16,185,129,0.4)' },
];

const TIPS = [
  { text: 'Speak clearly and confidently',    icon: '🎯' },
  { text: 'Structure your answer (STAR)',     icon: '⭐' },
  { text: 'Give specific, relevant examples', icon: '💡' },
  { text: 'Keep it concise and to the point', icon: '✂️' },
];

// Animated check icon for tips
function AnimatedCheck({ delay = 0, color = '#06B6D4' }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 400, damping: 20 }}
      className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5"
      style={{ background: `${color}18`, border: `1px solid ${color}50` }}
    >
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <motion.path
          d="M1.5 4l1.8 1.8L6.5 2"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: delay + 0.15, duration: 0.35 }}
        />
      </svg>
    </motion.div>
  );
}

export function STARFramework({ activeSection, onSelect }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 animate-float-slow relative overflow-hidden"
      style={{
        background: 'rgba(10,12,30,0.65)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(139,92,246,0.22)',
        boxShadow: '0 24px 70px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Corner accents */}
      <div className="absolute top-2 left-2 w-3 h-3 pointer-events-none"
        style={{ borderTop: '1px solid rgba(139,92,246,0.5)', borderLeft: '1px solid rgba(139,92,246,0.5)' }} />
      <div className="absolute bottom-2 right-2 w-3 h-3 pointer-events-none"
        style={{ borderBottom: '1px solid rgba(6,182,212,0.4)', borderRight: '1px solid rgba(6,182,212,0.4)' }} />

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <motion.span
          animate={{ rotate: [0, 15, -10, 15, 0] }}
          transition={{ repeat: Infinity, duration: 4, repeatDelay: 3 }}
          className="text-base"
        >⭐</motion.span>
        <h3 className="text-sm font-semibold text-white tracking-wide font-display">STAR Framework</h3>
        {/* Accent line */}
        <div className="flex-1 h-px ml-2"
          style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.4), transparent)' }} />
      </div>

      {/* STAR items */}
      {STAR.map(({ letter, label, desc, color, glow }, i) => {
        const active = activeSection === letter;
        return (
          <motion.button
            key={letter}
            onClick={() => onSelect(active ? null : letter)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2, x: 0 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 rounded-xl p-3 text-left cursor-pointer w-full"
            style={{
              background: active ? `${color}14` : 'rgba(255,255,255,0.025)',
              border: `1px solid ${active ? color + '55' : 'rgba(255,255,255,0.07)'}`,
              boxShadow: active ? `0 0 24px ${glow}, inset 0 0 12px ${color}08` : 'none',
              transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {/* Letter badge */}
            <motion.div
              animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={active ? { repeat: Infinity, duration: 1.5 } : {}}
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm font-mono"
              style={{
                background: active ? `${color}28` : `${color}12`,
                border: `1px solid ${active ? color + '60' : color + '30'}`,
                color,
                boxShadow: active ? `0 0 16px ${glow}` : 'none',
              }}
            >
              {letter}
            </motion.div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/90">{label}</p>
              <p className="text-2xs text-white/40 mt-0.5">{desc}</p>
            </div>

            {/* Active indicator */}
            {active && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="w-2 h-2 rounded-full ml-auto flex-shrink-0"
                style={{ background: color, boxShadow: `0 0 8px ${glow}` }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export function TipsPanel() {
  return (
    <div
      className="rounded-2xl p-5 animate-float relative overflow-hidden"
      style={{
        background: 'rgba(10,12,30,0.65)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(6,182,212,0.18)',
        boxShadow: '0 24px 70px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)',
        animationDelay: '1.2s',
      }}
    >
      {/* Corner accents */}
      <div className="absolute top-2 right-2 w-3 h-3 pointer-events-none"
        style={{ borderTop: '1px solid rgba(6,182,212,0.4)', borderRight: '1px solid rgba(6,182,212,0.4)' }} />

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">💡</span>
        <h3 className="text-sm font-semibold text-white font-display">Tips for a great answer</h3>
        <div className="flex-1 h-px ml-2"
          style={{ background: 'linear-gradient(90deg, rgba(6,182,212,0.35), transparent)' }} />
      </div>

      <div className="flex flex-col gap-2.5">
        {TIPS.map(({ text, icon }, i) => (
          <motion.div
            key={text}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
            whileHover={{ x: 3 }}
            className="flex items-start gap-2.5 group cursor-default"
          >
            <AnimatedCheck delay={0.35 + i * 0.08} color="#06B6D4" />
            <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors duration-200 leading-relaxed">
              {text}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent)' }} />
    </div>
  );
}
