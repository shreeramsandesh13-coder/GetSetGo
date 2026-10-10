import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, ArrowRight, Mail, Lock, Globe2 } from 'lucide-react';

/**
 * Auth Component - Wanderlust Light Login Screen
 * 
 * Rules:
 * - Clean email/password login screen
 * - Sequential "GET... SET... GO..." typography animation upon login
 * - Transitions to Dashboard when animation completes
 */
export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('traveler@getsetgo.world');
  const [password, setPassword] = useState('••••••••');
  const [isAnimating, setIsAnimating] = useState(false);
  const [flashWord, setFlashWord] = useState(''); // 'GET' | 'SET' | 'GO...' | ''

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isAnimating) return;
    setIsAnimating(true);
  };

  useEffect(() => {
    if (!isAnimating) return;

    // Sequential timing for GET... SET... GO...
    const t1 = setTimeout(() => setFlashWord('GET'), 250);
    const t2 = setTimeout(() => setFlashWord('SET'), 1000);
    const t3 = setTimeout(() => setFlashWord('GO...'), 1750);
    const t4 = setTimeout(() => {
      setFlashWord('');
      if (onLogin) onLogin();
    }, 2550);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isAnimating, onLogin]);

  return (
    <div className="h-full w-full flex items-center justify-center p-6 bg-gradient-to-b from-sky-50 via-white to-sky-100/50 relative overflow-hidden select-none">
      {/* Subtle Airy Background Gradients */}
      <div className="absolute top-0 -left-10 w-48 h-48 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-10 w-56 h-56 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-sky-100/70 border border-sky-100 p-6 sm:p-7 space-y-5 relative z-10">
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25 mb-3 transition-transform hover:rotate-6 duration-300">
            <Compass className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>Smart Travel Super App</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            GetSetGo
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            AI Vision Scanner, Delulu Guide, and Offline Regional Maps for global wanderers.
          </p>
        </div>

        {/* Email/Password Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 px-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                required
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-100 rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 px-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-100 rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Login Button with Native Touch Feedback */}
          <button
            type="submit"
            disabled={isAnimating}
            className="w-full h-14 min-h-[3.5rem] mt-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 text-base transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            <span>Log In & Explore</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-sky-500" />
            <span>Ready for offline trips • Powered by gpt-4o-mini</span>
          </p>
        </div>
      </div>

      {/* SEQUENTIAL "GET... SET... GO..." TYPOGRAPHY ANIMATION */}
      {isAnimating && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center px-6 text-center animate-in fade-in duration-200">
          {flashWord === 'GET' && (
            <div className="animate-pop-in flex flex-col items-center space-y-3">
              <span className="text-8xl sm:text-9xl font-black text-sky-500 tracking-tight drop-shadow-sm">
                GET
              </span>
              <p className="text-xs sm:text-sm font-bold text-sky-700 uppercase tracking-widest bg-sky-50 px-4 py-1.5 rounded-full border border-sky-100">
                Calibrating AI vision sensors...
              </p>
            </div>
          )}

          {flashWord === 'SET' && (
            <div className="animate-pop-in flex flex-col items-center space-y-3">
              <span className="text-8xl sm:text-9xl font-black text-blue-600 tracking-tight drop-shadow-sm">
                SET
              </span>
              <p className="text-xs sm:text-sm font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                Connecting to Delulu AI guide...
              </p>
            </div>
          )}

          {flashWord === 'GO...' && (
            <div className="animate-pop-slam flex flex-col items-center space-y-3">
              <span className="text-8xl sm:text-9xl font-black text-emerald-500 tracking-tight drop-shadow-sm">
                GO...
              </span>
              <p className="text-xs sm:text-sm font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                Ready to explore!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Embedded Animations */}
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.7); opacity: 0; filter: blur(4px); }
          50% { transform: scale(1.05); opacity: 1; filter: blur(0); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes popSlam {
          0% { transform: scale(1.3); opacity: 0; }
          60% { transform: scale(0.96); opacity: 1; }
          100% { transform: scale(1.03); opacity: 1; }
        }
        .animate-pop-in {
          animation: popIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-pop-slam {
          animation: popSlam 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
