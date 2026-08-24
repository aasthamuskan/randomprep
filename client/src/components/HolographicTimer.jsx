import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ── Constants ─────────────────────────────────────────────────────────────────
const CX = 180;
const CY = 180;
const R_OUTER  = 158;
const R_MID    = 138;
const R_INNER  = 118;
const R_DECO   = 100;
const C_OUTER  = 2 * Math.PI * R_OUTER;
const C_MID    = 2 * Math.PI * R_MID;
const SIZE     = 360;

function polarToXY(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// ── Tick marks ────────────────────────────────────────────────────────────────
function Ticks({ cx = CX, cy = CY, r = 166, count = 60 }) {
  const ticks = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 360;
    const isMajor = i % 5 === 0;
    const inner = polarToXY(cx, cy, r - (isMajor ? 10 : 6), angle);
    const outer = polarToXY(cx, cy, r, angle);
    ticks.push(
      <line key={i}
        x1={inner.x} y1={inner.y}
        x2={outer.x} y2={outer.y}
        stroke={isMajor ? 'rgba(139,92,246,0.75)' : 'rgba(139,92,246,0.22)'}
        strokeWidth={isMajor ? 1.5 : 0.75}
      />
    );
  }
  return <>{ticks}</>;
}

// ── Energy pulse point that travels around the arc ────────────────────────────
function EnergyPulsePoint({ pct, running }) {
  const angle = -90 + (1 - pct) * 360; // travels opposite to progress
  const { x, y } = polarToXY(CX, CY, R_OUTER, (1 - pct) * 360 - 90 + 90);
  if (!running) return null;
  return (
    <g>
      <circle cx={x} cy={y} r={5} fill="white" opacity={0.9}
        style={{ filter: 'drop-shadow(0 0 6px #A78BFA) drop-shadow(0 0 12px #8B5CF6)' }} />
      <circle cx={x} cy={y} r={9} fill="none" stroke="rgba(167,139,250,0.4)" strokeWidth={2} />
    </g>
  );
}

// ── Main timer component ──────────────────────────────────────────────────────
export default function HolographicTimer({ remaining, total, running, mm, ss, onDurationChange, duration }) {
  const canvasRef = useRef();
  const animRef   = useRef();

  // Particle orbit + inner reactor glow animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    // Orbiting particles
    const particles = Array.from({ length: 22 }, (_, i) => ({
      angle: (i / 22) * Math.PI * 2,
      speed: 0.0025 + Math.random() * 0.003,
      r: R_OUTER - 2 + Math.random() * 8,
      size: 1.5 + Math.random() * 2.5,
      color: i % 3 === 0 ? '#8B5CF6' : i % 3 === 1 ? '#06B6D4' : '#A855F7',
      alpha: 0.4 + Math.random() * 0.55,
    }));

    // Inner floating particles (reactor core)
    const innerParticles = Array.from({ length: 12 }, (_, i) => ({
      x: cx + (Math.random() - 0.5) * 100,
      y: cy + (Math.random() - 0.5) * 100,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4 - 0.2,
      life: Math.random(),
      size: 1 + Math.random() * 1.5,
      color: Math.random() > 0.5 ? '#8B5CF6' : '#06B6D4',
    }));

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.016;

      // ── Reactor core glow ──
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
      const pulse = 0.5 + Math.sin(t * 1.5) * 0.25;
      coreGlow.addColorStop(0, `rgba(139,92,246,${0.08 + pulse * 0.06})`);
      coreGlow.addColorStop(0.4, `rgba(6,182,212,${0.04 + pulse * 0.03})`);
      coreGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.fill();

      // ── Inner floating particles ──
      innerParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.006;
        if (p.life <= 0) {
          p.x = cx + (Math.random() - 0.5) * 60;
          p.y = cy + (Math.random() - 0.5) * 60;
          p.life = 1;
          p.vy = (Math.random() - 0.5) * 0.4 - 0.3;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life * 0.5;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // ── Orbiting particles ──
      particles.forEach((p) => {
        if (running) p.angle += p.speed;
        const x = cx + p.r * Math.cos(p.angle);
        const y = cy + p.r * Math.sin(p.angle);

        // Trail
        ctx.beginPath();
        ctx.arc(
          x - Math.cos(p.angle) * 6,
          y - Math.sin(p.angle) * 6,
          p.size * 0.4, 0, Math.PI * 2
        );
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.25;
        ctx.fill();

        // Main dot
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Glow halo
        const halo = ctx.createRadialGradient(x, y, 0, x, y, p.size * 3);
        halo.addColorStop(0, p.color + '60');
        halo.addColorStop(1, 'transparent');
        ctx.fillStyle = halo;
        ctx.globalAlpha = p.alpha * 0.4;
        ctx.beginPath();
        ctx.arc(x, y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [running]);

  const pct        = total > 0 ? remaining / total : 1;
  const progressOffset = C_OUTER * (1 - pct);
  const midOffset      = C_MID * (1 - pct * 0.65 - 0.18);
  const isLow          = remaining <= 30 && running;

  const DURATIONS = [
    { label: '⏱ 1 min', value: 60 },
    { label: '⏱ 2 min', value: 120 },
    { label: '⏱ 5 min', value: 300 },
  ];

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Main timer circle */}
      <div
        className="relative animate-float-slow"
        style={{ width: SIZE, height: SIZE }}
      >
        {/* Canvas: particles + reactor glow */}
        <canvas
          ref={canvasRef}
          width={SIZE} height={SIZE}
          className="absolute inset-0 pointer-events-none"
        />

        {/* SVG rings */}
        <svg
          width={SIZE} height={SIZE}
          className="absolute inset-0"
          style={{ filter: isLow ? 'drop-shadow(0 0 30px rgba(239,68,68,0.5))' : 'drop-shadow(0 0 24px rgba(139,92,246,0.45))' }}
        >
          <defs>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#8B5CF6" />
              <stop offset="50%"  stopColor="#A855F7" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id="arcGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#A855F7" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="arcGradWarn" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#EF4444" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-strong">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ── Outermost decorative ring ── */}
          <circle cx={CX} cy={CY} r={175} fill="none" stroke="rgba(139,92,246,0.05)" strokeWidth={1} />

          {/* ── Tick marks ── */}
          <Ticks cx={CX} cy={CY} r={170} count={60} />

          {/* ── Outer progress track ── */}
          <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={10} />

          {/* ── Outer progress fill ── */}
          <circle
            cx={CX} cy={CY} r={R_OUTER}
            fill="none"
            stroke={isLow ? 'url(#arcGradWarn)' : 'url(#arcGrad)'}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={C_OUTER}
            strokeDashoffset={progressOffset}
            transform={`rotate(-90 ${CX} ${CY})`}
            filter="url(#glow)"
            style={{
              transition: running ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.3s ease',
            }}
          />

          {/* ── Mid ring track ── */}
          <circle cx={CX} cy={CY} r={R_MID} fill="none" stroke="rgba(168,85,247,0.07)" strokeWidth={5} />
          {/* ── Mid ring fill ── */}
          <circle
            cx={CX} cy={CY} r={R_MID}
            fill="none"
            stroke="url(#arcGrad2)"
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={C_MID}
            strokeDashoffset={midOffset}
            transform={`rotate(90 ${CX} ${CY})`}
            style={{ transition: running ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.3s ease' }}
          />

          {/* ── Inner decorative dashed ring ── */}
          <circle cx={CX} cy={CY} r={R_INNER} fill="none" stroke="rgba(6,182,212,0.12)" strokeWidth={1} strokeDasharray="3 7" />

          {/* ── Inner deco ring 2 ── */}
          <circle cx={CX} cy={CY} r={R_DECO} fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth={1} strokeDasharray="8 4" />

          {/* ── Glass inner surface ── */}
          <circle cx={CX} cy={CY} r={94} fill="rgba(5,7,20,0.8)" />
          <circle cx={CX} cy={CY} r={94} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1} />

          {/* ── Inner glass highlight ── */}
          <ellipse cx={CX - 20} cy={CY - 25} rx={35} ry={18}
            fill="rgba(255,255,255,0.025)" style={{ filter: 'blur(6px)' }} />

          {/* ── Energy pulse point ── */}
          <EnergyPulsePoint pct={pct} running={running} />

          {/* ── Warning ring overlay ── */}
          {isLow && (
            <circle cx={CX} cy={CY} r={R_OUTER}
              fill="none" stroke="rgba(239,68,68,0.35)" strokeWidth={14}
              strokeDasharray={C_OUTER} strokeDashoffset={progressOffset}
              transform={`rotate(-90 ${CX} ${CY})`}
              filter="url(#glow-strong)"
            >
              <animate attributeName="opacity" values="0.25;0.7;0.25" dur="0.8s" repeatCount="indefinite" />
            </circle>
          )}
        </svg>

        {/* ── Center content ── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-2xs font-mono tracking-[0.25em] uppercase mb-2"
            style={{ color: isLow ? 'rgba(239,68,68,0.8)' : 'rgba(167,139,250,0.8)' }}>
            Your Time
          </p>
          <motion.p
            key={`${mm}:${ss}`}
            initial={{ scale: 1.04 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            className="font-display font-bold tabular-nums leading-none"
            style={{
              fontSize: '4rem',
              letterSpacing: '-0.03em',
              color: isLow ? '#FCA5A5' : 'white',
              textShadow: isLow
                ? '0 0 20px rgba(239,68,68,0.9), 0 0 40px rgba(239,68,68,0.4)'
                : '0 0 30px rgba(139,92,246,0.8), 0 0 60px rgba(139,92,246,0.3)',
            }}
          >
            {mm}:{ss}
          </motion.p>
          <p className="text-xs mt-2 font-mono"
            style={{ color: 'rgba(103,232,249,0.5)' }}>
            of {String(Math.floor(total / 60)).padStart(2, '0')}:{String(total % 60).padStart(2, '0')}
          </p>
          {/* Running indicator */}
          {running && (
            <div className="mt-2 flex items-center gap-1.5">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-green-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              <span className="text-2xs font-mono text-green-400/70 tracking-wider">RUNNING</span>
            </div>
          )}
        </div>
      </div>

      {/* Duration selector */}
      <div className="flex items-center gap-2">
        {DURATIONS.map(({ label, value }) => (
          <motion.button
            key={value}
            onClick={() => onDurationChange(value)}
            whileHover={{ y: -2, scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-3 py-1.5 rounded-full text-xs font-mono border transition-all duration-200"
            style={
              duration === value
                ? {
                    background: 'rgba(139,92,246,0.2)',
                    borderColor: 'rgba(139,92,246,0.6)',
                    color: '#C4B5FD',
                    boxShadow: '0 0 14px rgba(139,92,246,0.25)',
                  }
                : {
                    background: 'rgba(255,255,255,0.02)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.4)',
                  }
            }
          >
            {label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
