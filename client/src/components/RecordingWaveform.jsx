import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecordingWaveform({ analyser, isRecording, elapsed, total }) {
  const canvasRef = useRef();
  const animRef   = useRef();
  const phaseRef  = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const bars = 90;
    const gap = 2;
    const barW = (W - bars * gap) / bars;
    let dataArray;

    if (analyser) {
      dataArray = new Uint8Array(analyser.frequencyBinCount);
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      phaseRef.current += isRecording ? 0.06 : 0.015;

      let values = [];
      if (analyser && isRecording) {
        analyser.getByteFrequencyData(dataArray);
        for (let i = 0; i < bars; i++) {
          const idx = Math.floor((i / bars) * (dataArray.length * 0.65));
          values.push(dataArray[idx] / 255);
        }
      } else {
        for (let i = 0; i < bars; i++) {
          const base = Math.sin(i * 0.18 + phaseRef.current) * 0.35;
          const mid  = Math.sin(i * 0.45 + phaseRef.current * 1.4) * 0.2;
          const hi   = Math.sin(i * 0.9  + phaseRef.current * 0.8) * 0.1;
          const raw  = Math.abs(base + mid + hi);
          values.push(raw * (isRecording ? 1 : 0.22));
        }
      }

      const mid = Math.floor(bars / 2);

      for (let i = 0; i < bars; i++) {
        const v = values[i] || 0;
        const barH = Math.max(3, v * (H * 0.82));
        const x = i * (barW + gap);
        const y = (H - barH) / 2;

        // Mirrored symmetry — left half purple, right half cyan
        const isPurple = i < mid;
        const t = Math.abs(i - mid) / mid; // 0 at edge, 1 at center

        const rA = isPurple
          ? `rgba(168,85,247,${0.15 + v * 0.85})`
          : `rgba(6,182,212,${0.15 + v * 0.85})`;
        const rB = isPurple
          ? `rgba(139,92,246,${0.05 + v * 0.5})`
          : `rgba(59,130,246,${0.05 + v * 0.5})`;

        const grad = ctx.createLinearGradient(0, y, 0, y + barH);
        grad.addColorStop(0, rA);
        grad.addColorStop(0.5, rA);
        grad.addColorStop(1, rB);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, barW < 4 ? 1 : 2);
        ctx.fill();

        // Glow on tall bars
        if (v > 0.45 && isRecording) {
          const glowColor = isPurple ? 'rgba(168,85,247,0.6)' : 'rgba(6,182,212,0.6)';
          ctx.shadowBlur  = 10;
          ctx.shadowColor = glowColor;
          ctx.fill();
          ctx.shadowBlur  = 0;

          // Peak sparkle particle
          if (v > 0.7 && Math.random() < 0.15) {
            const px = x + barW / 2 + (Math.random() - 0.5) * 8;
            const py = y - 4 - Math.random() * 6;
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = isPurple ? '#C4B5FD' : '#67E8F9';
            ctx.globalAlpha = 0.8;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
      }

      // Center baseline glow
      const baseline = ctx.createLinearGradient(0, H / 2, W, H / 2);
      baseline.addColorStop(0, 'transparent');
      baseline.addColorStop(0.3, 'rgba(139,92,246,0.08)');
      baseline.addColorStop(0.5, 'rgba(6,182,212,0.1)');
      baseline.addColorStop(0.7, 'rgba(139,92,246,0.08)');
      baseline.addColorStop(1, 'transparent');
      ctx.fillStyle = baseline;
      ctx.fillRect(0, H / 2 - 1, W, 2);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [analyser, isRecording]);

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden"
      style={{
        background: 'rgba(8,10,26,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      {/* Holographic tint overlay */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.03) 0%, transparent 50%, rgba(6,182,212,0.03) 100%)',
        }}
      />

      {/* Status row */}
      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-2.5">
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                key="recording"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                {/* Pulsing red dot */}
                <div className="relative w-2.5 h-2.5">
                  <div className="absolute inset-0 rounded-full bg-red-500"
                    style={{ boxShadow: '0 0 8px rgba(239,68,68,0.9)' }} />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-500"
                    animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  />
                </div>
                <span className="text-xs font-mono font-semibold text-red-400"
                  style={{ textShadow: '0 0 10px rgba(239,68,68,0.6)' }}>
                  🔴 Recording...
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-white/15" />
                <span className="text-xs font-mono text-white/30">Recording will appear here</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right side — time elapsed indicator */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5"
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-2xs font-mono text-white/30"
            >
              {fmt(elapsed)} elapsed
            </motion.span>
          </motion.div>
        )}
      </div>

      {/* Waveform canvas */}
      <div className="relative rounded-xl overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 0' }}>
        <canvas
          ref={canvasRef}
          width={800} height={64}
          className="w-full rounded-xl"
          style={{ maxHeight: 64, display: 'block' }}
        />
        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-8 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, rgba(8,10,26,0.8), transparent)' }} />
        <div className="absolute inset-y-0 right-0 w-8 pointer-events-none"
          style={{ background: 'linear-gradient(-90deg, rgba(8,10,26,0.8), transparent)' }} />
      </div>

      {/* Time labels + hint */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-white/25">{fmt(elapsed)}</span>
        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.span
              key="listening"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-xs font-medium italic"
              style={{ color: 'rgba(167,139,250,0.7)' }}
            >
              Speak clearly. We're listening...
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-white/25 italic"
            >
              Start the interview to begin recording
            </motion.span>
          )}
        </AnimatePresence>
        <span className="text-xs font-mono text-white/25">{fmt(total)}</span>
      </div>

      {/* Bottom neon line */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.25), rgba(6,182,212,0.25), transparent)' }} />
    </div>
  );
}
