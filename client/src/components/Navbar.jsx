import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getStats } from '../services/api';

const navItems = [
  { to: '/subjects',  label: 'Subjects' },
  { to: '/practice',  label: 'Practice' },
  { to: '/history',   label: 'History' },
  { to: '/progress',  label: 'Progress' },
];

// Holographic logo
function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group" aria-label="TechPrep Home">
      <motion.div
        whileHover={{ scale: 1.08, rotate: 3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl animate-logo-glow"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.5), rgba(6,182,212,0.4))',
          border: '1px solid rgba(139,92,246,0.6)',
        }}
      >
        {/* Inner glow */}
        <div className="absolute inset-0 rounded-xl opacity-40"
          style={{ background: 'radial-gradient(circle at 40% 30%, rgba(255,255,255,0.25), transparent 70%)' }} />
        <span className="relative text-white font-mono font-bold text-sm" style={{ letterSpacing: '-0.02em' }}>
          {'</>'}
        </span>
        {/* Corner accent */}
        <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-cyan-400/60 rounded-tl" />
        <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-purple-400/60 rounded-br" />
      </motion.div>
      <span
        className="font-display font-bold text-white tracking-tight text-base"
        style={{ textShadow: '0 0 20px rgba(139,92,246,0.5)' }}
      >
        TechPrep
      </span>
    </Link>
  );
}

// Individual nav item
function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
          isActive ? 'text-white' : 'text-white/40 hover:text-white/80'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="nav-pill"
              className="absolute inset-0 rounded-lg"
              style={{
                background: 'rgba(139,92,246,0.12)',
                border: '1px solid rgba(139,92,246,0.35)',
                boxShadow: '0 0 16px rgba(139,92,246,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            />
          )}
          <span className="relative z-10">{label}</span>
          {isActive && (
            <motion.div
              layoutId="nav-underline"
              className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)',
                width: '60%',
                boxShadow: '0 0 8px rgba(139,92,246,0.6)',
              }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

// Streak indicator
function StreakChip() {
  const [streak, setStreak] = useState(1);

  useEffect(() => {
    getStats()
      ? getStats().then(data => {
          if (data?.stats?.streak !== undefined) {
            setStreak(data.stats.streak || 1);
          }
        }).catch(() => {})
      : null;
  }, []);

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -1 }}
      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-default select-none"
      style={{
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.3)',
        boxShadow: '0 0 16px rgba(245,158,11,0.1)',
      }}
    >
      <span className="animate-streak-flame inline-block" style={{ fontSize: 14 }}>🔥</span>
      <span className="text-xs font-mono font-semibold" style={{ color: '#FCD34D' }}>{streak} Day Streak</span>
    </motion.div>
  );
}

// Profile avatar
function ProfileAvatar() {
  return (
    <motion.div
      whileHover={{ scale: 1.08, rotate: 5 }}
      transition={{ type: 'spring', stiffness: 400 }}
      className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center cursor-pointer animate-float-slow"
      style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.3))',
        border: '1.5px solid rgba(139,92,246,0.5)',
        boxShadow: '0 0 14px rgba(139,92,246,0.25)',
      }}
    >
      <span className="text-sm font-bold text-white/90">A</span>
    </motion.div>
  );
}

export default function Navbar() {
  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'rgba(4,6,15,0.88)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderBottom: '1px solid rgba(139,92,246,0.14)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(139,92,246,0.08)',
      }}
    >
      <nav className="max-w-[1280px] mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Logo />

        {/* Nav links */}
        <div className="flex items-center gap-0.5">
          {navItems.map(({ to, label }) => (
            <NavItem key={to} to={to} label={label} />
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <StreakChip />
          <ProfileAvatar />
        </div>
      </nav>
    </header>
  );
}
