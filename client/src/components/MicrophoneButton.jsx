import { motion } from 'framer-motion';

// Microphone SVG icon
function MicIcon({ color, size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="2" width="6" height="11" rx="3"
        fill={color}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
      <path d="M5 10c0 3.866 3.134 7 7 7s7-3.134 7-7"
        stroke={color}
        strokeWidth="2" strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
      <line x1="12" y1="17" x2="12" y2="21"
        stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="21" x2="15" y2="21"
        stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Pause icon
function PauseIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="6" y="4" width="4" height="16" rx="2" fill="rgba(255,255,255,0.9)" />
      <rect x="14" y="4" width="4" height="16" rx="2" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

// Play/Resume icon
function PlayIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M5 3l14 9-14 9V3z" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

export default function MicrophoneButton({ state, onClick }) {
  const isRecording  = state === 'recording';
  const isPaused     = state === 'paused';
  const isIdle       = state === 'idle';
  const isSubmitting = state === 'submitting';

  const primaryColor = isRecording ? '#EF4444' : isPaused ? '#F59E0B' : '#8B5CF6';
  const accentColor  = isRecording ? '#F97316' : isPaused ? '#FBBF24' : '#06B6D4';

  const label = isRecording
    ? '🔴 Recording...'
    : isPaused
    ? '⏸ Paused'
    : isIdle
    ? '🎙 Start Answer'
    : '⏳ Processing...';

  const sublabel = isRecording
    ? 'Click to pause'
    : isPaused
    ? 'Click to resume'
    : isIdle
    ? 'Press Space to begin'
    : 'Please wait';

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Outer environment rings */}
      <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>

        {/* CSS orbit ring 1 */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 150, height: 150,
            border: `1px solid ${primaryColor}20`,
            animation: `ring-rotate ${isRecording ? '4s' : '10s'} linear infinite`,
          }}
        />
        {/* CSS orbit ring 2 */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 130, height: 130,
            border: `1px dashed ${accentColor}18`,
            animation: `ring-rotate ${isRecording ? '6s' : '15s'} linear infinite reverse`,
          }}
        />

        {/* Pulse rings — outer */}
        {(isRecording || isIdle) && (
          <>
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{ width: 140, height: 140, border: `1px solid ${primaryColor}30` }}
              animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: isRecording ? 1.2 : 3, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{ width: 120, height: 120, border: `1px solid ${primaryColor}25` }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: isRecording ? 1.2 : 3, ease: 'easeInOut', delay: 0.3 }}
            />
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{ width: 105, height: 105, border: `1px solid ${accentColor}20` }}
              animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: isRecording ? 1.2 : 3, ease: 'easeInOut', delay: 0.6 }}
            />
          </>
        )}

        {/* Energy aura background */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 88, height: 88 }}
          animate={isRecording
            ? { opacity: [0.5, 0.9, 0.5], scale: [1, 1.06, 1] }
            : { opacity: [0.3, 0.5, 0.3], scale: [1, 1.02, 1] }
          }
          transition={{ repeat: Infinity, duration: isRecording ? 1 : 3, ease: 'easeInOut' }}
        >
          <div style={{
            width: '100%', height: '100%',
            background: `radial-gradient(circle, ${primaryColor}40 0%, ${accentColor}20 50%, transparent 80%)`,
            borderRadius: '50%',
            filter: 'blur(8px)',
          }} />
        </motion.div>

        {/* Main button */}
        <motion.button
          id="mic-button"
          onClick={onClick}
          disabled={isSubmitting}
          whileHover={!isSubmitting ? { scale: 1.1 } : {}}
          whileTap={!isSubmitting ? { scale: 0.93 } : {}}
          animate={
            isIdle
              ? { scale: [1, 1.03, 1] }
              : isRecording
              ? { scale: [1, 1.04, 1] }
              : {}
          }
          transition={
            isIdle || isRecording
              ? { repeat: Infinity, duration: isRecording ? 1.2 : 3, ease: 'easeInOut' }
              : { type: 'spring', stiffness: 300 }
          }
          className="relative w-20 h-20 rounded-full flex flex-col items-center justify-center cursor-pointer z-10"
          style={{
            background: `radial-gradient(circle at 38% 32%, ${primaryColor}50, ${accentColor}30, rgba(0,0,0,0.4))`,
            border: `2px solid ${primaryColor}70`,
            boxShadow: `
              0 0 0 1px ${primaryColor}20,
              0 0 30px ${primaryColor}50,
              0 0 60px ${primaryColor}20,
              inset 0 1px 0 rgba(255,255,255,0.12)
            `,
            backdropFilter: 'blur(16px)',
            opacity: isSubmitting ? 0.5 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
          aria-label={label}
        >
          {/* Button glass highlight */}
          <div className="absolute top-2 left-2 w-8 h-5 rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse, white, transparent)' }} />

          {/* Icon */}
          {isIdle && <MicIcon color="rgba(255,255,255,0.95)" size={28} />}
          {isRecording && <MicIcon color="#FCA5A5" size={28} />}
          {isPaused && <PlayIcon />}
          {isSubmitting && (
            <motion.div
              className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            />
          )}
        </motion.button>
      </div>

      {/* Labels */}
      <div className="flex flex-col items-center gap-1">
        <motion.p
          key={label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold font-display"
          style={{
            color: primaryColor,
            textShadow: `0 0 12px ${primaryColor}80`,
          }}
        >
          {label}
        </motion.p>
        <p className="text-2xs font-mono text-white/30">{sublabel}</p>
      </div>
    </div>
  );
}
