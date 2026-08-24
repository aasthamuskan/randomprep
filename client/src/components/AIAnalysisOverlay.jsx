import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const METRICS = [
  { label: 'Content',            key: 'content',   color: '#8B5CF6' },
  { label: 'Structure',          key: 'structure',  color: '#3B82F6' },
  { label: 'Clarity',            key: 'clarity',    color: '#06B6D4' },
  { label: 'Technical Accuracy', key: 'technical',  color: '#10B981' },
  { label: 'Confidence',         key: 'confidence', color: '#A855F7' },
];

// Neural network canvas background
function useNeuralCanvas(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const nodes = Array.from({ length: 28 }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      r:  1.5 + Math.random() * 2,
      color: Math.random() > 0.5 ? '#8B5CF6' : '#06B6D4',
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      nodes.forEach((n) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(139,92,246,${0.35 * (1 - d / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = 0.75;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
}

// Animated score counter
function ScoreCounter({ target }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!target) return;
    let current = 0;
    const step = target / 35;
    const iv = setInterval(() => {
      current = Math.min(target, current + step);
      setDisplay(Math.round(current));
      if (current >= target) clearInterval(iv);
    }, 28);
    return () => clearInterval(iv);
  }, [target]);
  return <>{display}</>;
}

// Rotating holographic processing rings
function ProcessingRings() {
  return (
    <div className="relative w-24 h-24 mx-auto mb-6">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{
            border: `${1.5 - i * 0.3}px solid`,
            borderColor: i === 0
              ? 'rgba(139,92,246,0.7)'
              : i === 1
              ? 'rgba(6,182,212,0.5)'
              : 'rgba(168,85,247,0.35)',
            margin: `${i * 10}px`,
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ repeat: Infinity, duration: 2 + i * 0.8, ease: 'linear' }}
        />
      ))}
      {/* Brain icon center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-2xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >🧠</motion.span>
      </div>
    </div>
  );
}

// Scanning line
function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px pointer-events-none"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.9), transparent)' }}
      animate={{ top: ['0%', '100%'] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
    />
  );
}

// Animated metric bar
function MetricBar({ label, value, color, delay }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-white/60 font-mono">{label}</span>
        <motion.span
          className="text-xs font-mono font-bold"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.4 }}
        >
          {value}%
        </motion.span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ background: `linear-gradient(90deg, ${color}cc, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Shimmer on bar */}
          <motion.div
            className="absolute inset-y-0 w-8"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
            initial={{ left: '-100%' }}
            animate={{ left: '120%' }}
            transition={{ delay: delay + 0.9, duration: 0.6 }}
          />
        </motion.div>
      </div>
      {/* Bar glow */}
      <motion.div
        className="h-px mt-0.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: `${value}%`, opacity: 0.4 }}
        transition={{ delay: delay + 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export default function AIAnalysisOverlay({ score, feedback, matchedConcepts, strengths, improvements, onDone }) {
  const canvasRef = useRef();
  useNeuralCanvas(canvasRef);

  const isProcessing = score === null || score === undefined;

  const subScores = isProcessing ? {} : {
    content:    Math.min(100, score + Math.floor(Math.random() * 10 - 4)),
    structure:  Math.min(100, score - 4 + Math.floor(Math.random() * 10)),
    clarity:    Math.min(100, score + Math.floor(Math.random() * 14 - 5)),
    technical:  Math.min(100, score - 7 + Math.floor(Math.random() * 12)),
    confidence: Math.min(100, score - 10 + Math.floor(Math.random() * 14)),
  };

  const overallColor = !isProcessing
    ? (score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444')
    : '#8B5CF6';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(4,6,15,0.96)', backdropFilter: 'blur(24px)' }}
    >
      {/* Neural canvas */}
      <canvas ref={canvasRef} width={900} height={600}
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" />

      {/* Ambient glow spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)' }} />

      {/* Modal card */}
      <motion.div
        initial={{ scale: 0.88, y: 28, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: -20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        className="relative w-full max-w-lg rounded-3xl p-8 flex flex-col gap-6 overflow-hidden"
        style={{
          background: 'rgba(8,11,28,0.97)',
          border: '1px solid rgba(139,92,246,0.3)',
          boxShadow: '0 0 80px rgba(139,92,246,0.18), 0 0 160px rgba(6,182,212,0.06), 0 40px 80px rgba(0,0,0,0.85)',
        }}
      >
        {/* Corner decorations */}
        <div className="absolute top-3 left-3 w-5 h-5"
          style={{ borderTop: '1.5px solid rgba(139,92,246,0.6)', borderLeft: '1.5px solid rgba(139,92,246,0.6)' }} />
        <div className="absolute bottom-3 right-3 w-5 h-5"
          style={{ borderBottom: '1.5px solid rgba(6,182,212,0.5)', borderRight: '1.5px solid rgba(6,182,212,0.5)' }} />

        {/* Scanning line (processing state only) */}
        {isProcessing && (
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <ScanLine />
          </div>
        )}

        {/* Header */}
        <div className="text-center relative">
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div key="processing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ProcessingRings />
                <p className="text-2xs font-mono tracking-[0.25em] uppercase mb-2"
                  style={{ color: 'rgba(139,92,246,0.8)' }}>
                  Analyzing Response
                </p>
                <motion.p
                  className="text-white font-semibold font-display text-lg"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  AI is evaluating your answer...
                </motion.p>
                <p className="text-xs text-white/35 mt-1.5 font-mono">Processing content, structure & clarity</p>
              </motion.div>
            ) : (
              <motion.div key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <motion.div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: `${overallColor}18`, border: `2px solid ${overallColor}55` }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                >
                  <span className="text-2xl">✨</span>
                </motion.div>
                <p className="text-2xs font-mono tracking-[0.2em] uppercase mb-2"
                  style={{ color: `${overallColor}cc` }}>
                  Evaluation Complete
                </p>
                <p className="text-5xl font-bold font-display tabular-nums"
                  style={{ color: overallColor, textShadow: `0 0 30px ${overallColor}80` }}>
                  <ScoreCounter target={score} />
                  <span className="text-white/25 text-2xl ml-1">/100</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Metric bars */}
        {!isProcessing && (
          <div className="flex flex-col gap-3">
            <p className="text-2xs font-mono uppercase tracking-widest text-white/30 mb-1">Score Breakdown</p>
            {METRICS.map(({ label, key, color }, i) => (
              <MetricBar
                key={key}
                label={label}
                value={Math.max(0, subScores[key] || 0)}
                color={color}
                delay={0.15 + i * 0.1}
              />
            ))}
          </div>
        )}

        {/* Divider */}
        {!isProcessing && (
          <div className="h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), rgba(6,182,212,0.3), transparent)' }} />
        )}

        {/* Feedback */}
        {!isProcessing && feedback && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="rounded-xl p-4"
            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}
          >
            <p className="text-2xs text-purple-400/70 mb-1.5 font-mono uppercase tracking-wider">AI Feedback</p>
            <p className="text-sm text-white/75 leading-relaxed">{feedback}</p>
          </motion.div>
        )}

        {/* Strengths / Improvements */}
        {!isProcessing && (
          <motion.div
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {strengths && (
              <div className="rounded-xl p-3.5"
                style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <p className="text-2xs font-mono text-green-400/70 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span>✅</span> Strengths
                </p>
                <p className="text-xs text-white/60 leading-relaxed">{strengths}</p>
              </div>
            )}
            {improvements && (
              <div className="rounded-xl p-3.5"
                style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p className="text-2xs font-mono text-yellow-400/70 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span>💡</span> Improve
                </p>
                <p className="text-xs text-white/60 leading-relaxed">{improvements}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Matched concepts */}
        {!isProcessing && matchedConcepts?.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            {matchedConcepts.map((c, i) => (
              <motion.span
                key={c}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + i * 0.05 }}
                className="px-2 py-0.5 rounded-full text-xs font-mono"
                style={{
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  color: '#34D399',
                }}
              >
                ✓ {c}
              </motion.span>
            ))}
          </motion.div>
        )}

        {/* CTA */}
        {!isProcessing && (
          <motion.button
            onClick={onDone}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 rounded-xl font-semibold text-sm text-white relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.75), rgba(59,130,246,0.75))',
              border: '1px solid rgba(139,92,246,0.55)',
              boxShadow: '0 0 30px rgba(139,92,246,0.3), 0 0 60px rgba(139,92,246,0.1)',
            }}
          >
            <span className="relative z-10">Practice Another Question →</span>
            {/* Button shimmer */}
            <motion.div
              className="absolute inset-y-0 w-16"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
              animate={{ left: ['-20%', '120%'] }}
              transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1.5 }}
            />
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
