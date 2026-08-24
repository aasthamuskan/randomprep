import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomQuestion, savePractice, transcribeAudio } from '../services/api';
import MetaverseBackground from '../components/MetaverseBackground';
import HolographicTimer from '../components/HolographicTimer';
import QuestionPanel from '../components/QuestionPanel';
import { STARFramework, TipsPanel } from '../components/STARAndTips';
import RecordingWaveform from '../components/RecordingWaveform';
import MicrophoneButton from '../components/MicrophoneButton';
import AIAnalysisOverlay from '../components/AIAnalysisOverlay';

// ── Timer hook ─────────────────────────────────────────────────────────────────
function useInterviewTimer(initialSeconds) {
  const [total,     setTotal]     = useState(initialSeconds);
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running,   setRunning]   = useState(false);
  const intervalRef = useRef(null);

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = useCallback(() => {
    clear();
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setRemaining((p) => {
        if (p <= 1) {
          clear();
          setRunning(false);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
  }, []);

  const pause = useCallback(() => {
    clear();
    setRunning(false);
  }, []);

  const reset = useCallback((t) => {
    clear();
    const s = t !== undefined ? t : total;
    setTotal(s);
    setRemaining(s);
    setRunning(false);
  }, [total]);

  useEffect(() => () => clear(), []);

  const elapsed = Math.max(0, total - remaining);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return { remaining, total, running, elapsed, mm, ss, start, pause, reset };
}

// ── Mic hook with Live Speech-to-Text & Groq Whisper AI ───────────────────────
function useMicrophone(onLiveTranscript) {
  const [analyser, setAnalyser]               = useState(null);
  const [error,    setError]                  = useState('');
  const [isTranscribing, setIsTranscribing]   = useState(false);

  const streamRef                = useRef(null);
  const ctxRef                   = useRef(null);
  const mediaRecorderRef         = useRef(null);
  const audioChunksRef           = useRef([]);
  const recognitionRef           = useRef(null);
  const isListeningRef           = useRef(false);
  const accumulatedTranscriptRef = useRef('');
  const sessionTextRef           = useRef('');

  const requestMic = async () => {
    setError('');
    audioChunksRef.current = [];
    accumulatedTranscriptRef.current = '';
    sessionTextRef.current = '';
    isListeningRef.current = true;

    try {
      // 1. Get audio stream with fallback
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
      } catch (e) {
        console.warn('Advanced audio constraints failed, trying basic audio stream:', e);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      streamRef.current = stream;

      // 2. Audio Context for Waveform
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        ctxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 256;
        source.connect(analyserNode);
        setAnalyser(analyserNode);
      } catch (e) {
        console.warn('AudioContext init notice:', e);
      }

      // 3. MediaRecorder for Groq Whisper Backup
      try {
        let mimeType = '';
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mimeType = 'audio/webm;codecs=opus';
          else if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
          else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';

          const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
          };
          mediaRecorder.start(250);
        }
      } catch (e) {
        console.warn('MediaRecorder init fallback:', e);
      }

      // 4. Web Speech API for Real-Time On-Screen Transcript
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = navigator.language || 'en-US';

          rec.onresult = (event) => {
            let sessionCurrent = '';
            for (let i = 0; i < event.results.length; i++) {
              sessionCurrent += event.results[i][0].transcript + ' ';
            }
            sessionTextRef.current = sessionCurrent;
            const fullText = (accumulatedTranscriptRef.current + ' ' + sessionCurrent).trim();
            if (onLiveTranscript && fullText) {
              onLiveTranscript(fullText);
            }
          };

          rec.onend = () => {
            if (sessionTextRef.current) {
              accumulatedTranscriptRef.current = (accumulatedTranscriptRef.current + ' ' + sessionTextRef.current).trim();
              sessionTextRef.current = '';
            }
            if (isListeningRef.current && recognitionRef.current) {
              setTimeout(() => {
                if (isListeningRef.current && recognitionRef.current) {
                  try { rec.start(); } catch {}
                }
              }, 300);
            }
          };

          rec.onerror = (err) => {
            if (err.error !== 'aborted') {
              console.warn('SpeechRecognition notice:', err.error);
            }
            if (err.error === 'not-allowed' || err.error === 'service-not-allowed') {
              isListeningRef.current = false;
            }
          };

          rec.start();
          recognitionRef.current = rec;
        } catch (e) {
          console.warn('SpeechRecognition error:', e);
        }
      }

      return true;
    } catch (err) {
      console.error('Microphone access failed:', err);
      let errMsg = 'Microphone access denied or unavailable. Type your answer below instead.';
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        errMsg = '🔒 Microphone permission is blocked by your browser. Click the lock/mic icon near the URL bar to allow microphone access.';
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        errMsg = '🔌 No microphone device detected on your system. You can type your answer below instead.';
      }
      setError(errMsg);
      return false;
    }
  };

  const releaseMic = () => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }

    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close();
    setAnalyser(null);
  };

  const getAudioBase64AndTranscribe = async () => {
    try {
      setIsTranscribing(true);

      // Stop mediaRecorder to flush remaining audio chunks
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch {}
      }
      await new Promise((r) => setTimeout(r, 250));

      if (audioChunksRef.current.length === 0) return null;

      const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
      const blob = new Blob(audioChunksRef.current, { type: mimeType });

      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
      });
      reader.readAsDataURL(blob);
      const audioBase64 = await base64Promise;

      const res = await transcribeAudio(audioBase64, mimeType);
      return res?.text || null;
    } catch (e) {
      console.warn('Groq Whisper transcript fallback error:', e);
      return null;
    } finally {
      setIsTranscribing(false);
    }
  };

  return { analyser, error, isTranscribing, requestMic, releaseMic, getAudioBase64AndTranscribe };
}

// ── Holographic feature card ───────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, color = '#8B5CF6', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="rounded-xl p-4 flex flex-col gap-2 cursor-default relative overflow-hidden"
      style={{
        background: `${color}08`,
        border: `1px solid ${color}22`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${color}08`,
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 rounded-xl transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}15, transparent 70%)` }}
      />
      <motion.span
        whileHover={{ scale: 1.2 }}
        className="text-xl relative"
        style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
      >
        {icon}
      </motion.span>
      <p className="text-xs font-semibold relative" style={{ color }}>
        {title}
      </p>
      <p className="text-xs text-white/40 leading-relaxed relative">{desc}</p>
      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />
    </motion.div>
  );
}

// ── Feature bar ────────────────────────────────────────────────────────────────
function FeatureBar() {
  const features = [
    { icon: '🎙', title: 'Voice Answer',   desc: "Speak your answer naturally. We'll evaluate it for you.",    color: '#8B5CF6', delay: 0.1 },
    { icon: '🧠', title: 'AI Evaluation',  desc: 'Get detailed feedback on content, structure and communication.', color: '#06B6D4', delay: 0.2 },
    { icon: '📈', title: 'Track Progress', desc: 'Improve with every interview. Track your performance over time.', color: '#10B981', delay: 0.3 },
  ];
  return (
    <div className="grid grid-cols-3 gap-4">
      {features.map((f) => <FeatureCard key={f.title} {...f} />)}
    </div>
  );
}

// ── Keyboard shortcuts panel ───────────────────────────────────────────────────
function KeyboardShortcuts() {
  const shortcuts = [
    { key: 'Space', action: 'Start / Stop Recording' },
    { key: 'P',     action: 'Pause / Resume' },
    { key: 'Enter', action: 'Submit Answer' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-xl p-4 relative overflow-hidden"
      style={{
        background: 'rgba(10,12,30,0.6)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs" style={{ filter: 'drop-shadow(0 0 4px rgba(139,92,246,0.6))' }}>⌨️</span>
        <p className="text-xs font-semibold text-white/50 tracking-wide font-display">Keyboard Shortcuts</p>
      </div>
      {shortcuts.map(({ key, action }) => (
        <div key={key} className="flex items-center justify-between mb-2 last:mb-0">
          <kbd
            className="px-2 py-0.5 rounded text-xs font-mono text-white/70"
            style={{
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.3)',
              boxShadow: '0 0 8px rgba(139,92,246,0.1)',
              letterSpacing: '0.05em',
            }}
          >
            {key}
          </kbd>
          <span className="text-xs text-white/35 ml-3 flex-1 text-right font-mono">{action}</span>
        </div>
      ))}
      {/* Corner accent */}
      <div className="absolute top-2 right-2 w-3 h-3"
        style={{ borderTop: '1px solid rgba(139,92,246,0.4)', borderRight: '1px solid rgba(139,92,246,0.4)' }} />
    </motion.div>
  );
}

// ── Status bar (chips + End Interview) ─────────────────────────────────────────
function StatusBar({ question, interviewType }) {
  const chips = [
    { label: interviewType || 'Technical Interview', icon: '</>', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    { label: question?.category || 'Loading...',      icon: '⚙',    color: '#06B6D4', bg: 'rgba(6,182,212,0.08)' },
    { label: question?.difficulty || '...',            icon: '▲',    color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  ];

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {chips.map(({ label, icon, color, bg }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2, scale: 1.04 }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono cursor-default"
          style={{
            background: bg,
            border: `1px solid ${color}30`,
            color,
            backdropFilter: 'blur(8px)',
            boxShadow: `0 0 16px ${color}18`,
          }}
        >
          <span style={{ fontSize: 10 }}>{icon}</span>
          {label}
        </motion.div>
      ))}

      {/* End Interview / New Setup */}
      <div className="ml-auto flex items-center gap-2">
        <NavLink to="/">
          <motion.div
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono cursor-pointer"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#F87171',
              boxShadow: '0 0 12px rgba(239,68,68,0.1)',
            }}
          >
            <span>⊗</span>
            End Interview
          </motion.div>
        </NavLink>
      </div>
    </div>
  );
}

// ── Text answer fallback ───────────────────────────────────────────────────────
function TextAnswer({ value, onChange, visible }) {
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-white/30 uppercase tracking-wider">Text Answer (fallback)</span>
        <span className="text-xs font-mono text-white/20">
          {value.trim() ? value.trim().split(/\s+/).length : 0} words
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder="Type your answer here since microphone is unavailable..."
        className="w-full rounded-xl p-4 text-sm text-white/80 resize-y leading-relaxed outline-none transition-all duration-200"
        style={{
          background: 'rgba(10,12,30,0.6)',
          border: '1px solid rgba(139,92,246,0.2)',
          backdropFilter: 'blur(12px)',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'rgba(139,92,246,0.5)'; e.target.style.boxShadow = '0 0 20px rgba(139,92,246,0.1)'; }}
        onBlur={(e)  => { e.target.style.borderColor = 'rgba(139,92,246,0.2)'; e.target.style.boxShadow = 'none'; }}
        spellCheck={false}
      />
    </motion.div>
  );
}

// ── Loading state ──────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-40 gap-6">
      {/* Animated rings */}
      <div className="relative w-20 h-20">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              inset: `${i * 6}px`,
              border: `1.5px solid ${i === 0 ? 'rgba(139,92,246,0.7)' : i === 1 ? 'rgba(6,182,212,0.5)' : 'rgba(168,85,247,0.3)'}`,
            }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ repeat: Infinity, duration: 2 + i * 0.6, ease: 'linear' }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg">✦</span>
        </div>
      </div>
      <p className="text-sm font-mono" style={{ color: 'rgba(167,139,250,0.7)' }}>
        Generating AI question...
      </p>
      <div className="flex gap-1">
        {[0,1,2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 rounded-full bg-purple-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Interview state constants ───────────────────────────────────────────────────
const IS = { IDLE: 'idle', RECORDING: 'recording', PAUSED: 'paused', SUBMITTING: 'submitting', DONE: 'done' };

// ── MAIN PAGE ──────────────────────────────────────────────────────────────────
export default function Practice() {
  const location  = useLocation();

  const [question, setQuestion]         = useState(location.state?.question || null);
  const [interviewType]                 = useState(location.state?.interviewType || 'Technical');
  const [role]                          = useState(location.state?.role || '');
  const [fetchLoading, setFetchLoading] = useState(!location.state?.question);
  const [fetchError,   setFetchError]   = useState('');
  const [textAnswer,   setTextAnswer]   = useState('');
  const [micState,     setMicState]     = useState(IS.IDLE);
  const [starSection,  setStarSection]  = useState(null);
  const [duration,     setDuration]     = useState(120);
  const [evaluation,   setEvaluation]   = useState(null);
  const [showOverlay,  setShowOverlay]  = useState(false);
  const [mouse,        setMouse]        = useState({ x: 0, y: 0 });

  const timer = useInterviewTimer(duration);
  const mic   = useMicrophone(setTextAnswer);

  // Mouse parallax
  useEffect(() => {
    const handler = (e) => {
      setMouse({
        x: (e.clientX / window.innerWidth  - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // Fetch question with support for preset question or subject/subTopic from navigation state
  const fetchQuestion = useCallback(async () => {
    setFetchLoading(true);
    setFetchError('');
    try {
      if (location.state?.presetQuestion) {
        setQuestion(location.state.presetQuestion);
      } else {
        const params = {};
        if (location.state?.subject) params.subject = location.state.subject;
        if (location.state?.subTopic) params.subTopic = location.state.subTopic;

        const data = await getRandomQuestion(params);
        setQuestion(data.question);
      }
      setTextAnswer('');
      setEvaluation(null);
      setShowOverlay(false);
      setMicState(IS.IDLE);
      timer.reset(duration);
      mic.releaseMic();
    } catch {
      setFetchError('Could not load a question. Check the server.');
    } finally {
      setFetchLoading(false);
    }
  }, [duration, location.state]);

  useEffect(() => { if (!question) fetchQuestion(); }, [fetchQuestion]);

  const handleDurationChange = (secs) => { setDuration(secs); timer.reset(secs); };

  const handleMicToggle = async () => {
    if (micState === IS.IDLE) {
      const ok = await mic.requestMic();
      if (!ok && !textAnswer) setTextAnswer('');
      setMicState(IS.RECORDING);
      timer.start();
    } else if (micState === IS.RECORDING) {
      setMicState(IS.PAUSED);
      timer.pause();
    } else if (micState === IS.PAUSED) {
      setMicState(IS.RECORDING);
      timer.start();
    }
  };

  const handlePause = () => {
    if (micState === IS.RECORDING) {
      setMicState(IS.PAUSED);
      timer.pause();
    }
  };

  const handleSubmit = async () => {
    if (micState === IS.IDLE) return;
    timer.pause();
    setMicState(IS.SUBMITTING);
    setShowOverlay(true);

    let finalAnswer = textAnswer.trim();

    // If live transcript was short or empty, attempt Groq Whisper AI transcription
    if (!finalAnswer || finalAnswer.length < 10) {
      const whisperText = await mic.getAudioBase64AndTranscribe();
      if (whisperText) {
        finalAnswer = whisperText;
        setTextAnswer(whisperText);
      }
    }

    mic.releaseMic();

    try {
      const data = await savePractice({
        questionId:       question.id,
        question:         question.question,
        answer:           finalAnswer || '[Voice answer submitted]',
        timeTaken:        timer.elapsed,
        expectedConcepts: question.expectedConcepts || [],
        idealAnswer:      question.idealAnswer || '',
        category:         question.category,
        difficulty:       question.difficulty,
      });
      setEvaluation(data.practice);
      setMicState(IS.DONE);
    } catch {
      setMicState(IS.PAUSED);
      setShowOverlay(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); handleMicToggle(); }
      if (e.code === 'KeyP')  { e.preventDefault(); if (micState === IS.RECORDING) handlePause(); }
      if (e.code === 'Enter') { e.preventDefault(); if (micState !== IS.IDLE) handleSubmit(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [micState, handleMicToggle, handlePause, handleSubmit]);

  const handleNext = () => {
    setQuestion(null);
    setEvaluation(null);
    setShowOverlay(false);
    setMicState(IS.IDLE);
    setTextAnswer('');
    timer.reset(duration);
    fetchQuestion();
  };

  const isRecording = micState === IS.RECORDING;
  const hasMicError = !!mic.error;

  return (
    <div className="relative min-h-screen" style={{ background: '#04060F' }}>
      {/* 3D Metaverse background */}
      <MetaverseBackground mouseX={mouse.x} mouseY={mouse.y} />

      {/* AI Analysis Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <AIAnalysisOverlay
            score={evaluation?.score ?? null}
            feedback={evaluation?.feedback}
            matchedConcepts={evaluation?.matchedConcepts}
            strengths={evaluation?.strengths}
            improvements={evaluation?.improvements}
            onDone={handleNext}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-6 flex flex-col gap-6">

        {/* Status bar */}
        <StatusBar question={question} interviewType={interviewType} role={role} />

        {/* Loading */}
        {fetchLoading && <LoadingState />}

        {/* Interview chamber */}
        {!fetchLoading && question && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* ── 3-column interview chamber ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px_288px] gap-6 items-start">

              {/* LEFT: Question panel */}
              <QuestionPanel question={question} />

              {/* CENTER: Timer + Mic */}
              <div className="flex flex-col items-center gap-5">
                <HolographicTimer
                  remaining={timer.remaining}
                  total={timer.total}
                  running={timer.running}
                  mm={timer.mm}
                  ss={timer.ss}
                  duration={duration}
                  onDurationChange={handleDurationChange}
                />

                {/* Mic button */}
                <MicrophoneButton state={micState} onClick={handleMicToggle} />

                {/* Submit / Pause controls */}
                <AnimatePresence>
                  {micState !== IS.IDLE && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center gap-2"
                    >
                      <motion.button
                        onClick={handleSubmit}
                        disabled={micState === IS.SUBMITTING}
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-5 py-2 rounded-xl text-sm font-semibold text-white relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(139,92,246,0.65), rgba(6,182,212,0.65))',
                          border: '1px solid rgba(139,92,246,0.5)',
                          boxShadow: '0 0 20px rgba(139,92,246,0.3)',
                          opacity: micState === IS.SUBMITTING ? 0.6 : 1,
                        }}
                      >
                        Submit Answer
                      </motion.button>

                      {micState !== IS.SUBMITTING && (
                        <motion.button
                          onClick={handleMicToggle}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          className="px-4 py-2 rounded-xl text-sm font-mono transition-colors"
                          style={{
                            color: 'rgba(255,255,255,0.5)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.02)',
                          }}
                        >
                          {isRecording ? 'Pause' : 'Resume'}
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mic error message */}
                {hasMicError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-yellow-400/70 text-center max-w-[280px] font-mono"
                  >
                    ⚠ {mic.error}
                  </motion.p>
                )}
              </div>

              {/* RIGHT: STAR + Tips */}
              <div className="flex flex-col gap-4">
                <STARFramework activeSection={starSection} onSelect={setStarSection} />
                <TipsPanel />
              </div>
            </div>

            {/* ── Waveform + text fallback ── */}
            <div className="flex flex-col gap-4 mt-6">
              <RecordingWaveform
                analyser={mic.analyser}
                isRecording={isRecording}
                elapsed={timer.elapsed}
                total={timer.total}
              />
              <TextAnswer
                value={textAnswer}
                onChange={setTextAnswer}
                visible={hasMicError || micState !== IS.IDLE}
              />
            </div>

            {/* ── Bottom: Feature bar + Keyboard shortcuts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 mt-6">
              <FeatureBar />
              <KeyboardShortcuts />
            </div>
          </motion.div>
        )}

        {/* Error state */}
        {!fetchLoading && !question && fetchError && (
          <div className="flex flex-col items-center justify-center py-40 gap-5">
            <div className="text-3xl">⚠</div>
            <p className="text-sm text-red-400 font-mono">{fetchError}</p>
            <motion.button
              onClick={fetchQuestion}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-2.5 rounded-xl text-sm text-white font-semibold"
              style={{
                background: 'rgba(139,92,246,0.25)',
                border: '1px solid rgba(139,92,246,0.4)',
                boxShadow: '0 0 20px rgba(139,92,246,0.2)',
              }}
            >
              Retry
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
