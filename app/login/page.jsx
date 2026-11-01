'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Sparkles, UserCheck, KeyRound, ArrowRight, AlertCircle, Award } from 'lucide-react';

const PRESET_ACCOUNTS = [
  { username: 'judge1', name: 'Judge 1', pin: '1001', pass: 'judge1@hack2026', role: 'Judge' },
  { username: 'judge2', name: 'Judge 2', pin: '1002', pass: 'judge2@hack2026', role: 'Judge' },
  { username: 'judge3', name: 'Judge 3', pin: '1003', pass: 'judge3@hack2026', role: 'Judge' },
  { username: 'admin', name: 'Admin Lead', pin: '9999', pass: 'admin@hack2026', role: 'Admin' },
];

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e, customId, customSecret) {
    if (e) e.preventDefault();
    const idToUse = customId || identifier;
    const secretToUse = customSecret || secret;

    if (!idToUse.trim()) {
      setError('Please enter your username or PIN.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: idToUse, secret: secretToUse }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check credentials.');
      }

      if (data.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/judge');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function applyPreset(preset) {
    setIdentifier(preset.username);
    setSecret(preset.pass);
    handleLogin(null, preset.username, preset.pass);
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col justify-between selection:bg-[#ff7a1a]/30 relative overflow-hidden">
      {/* Ambient glowing atmosphere */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[650px] h-[300px] bg-gradient-to-b from-[#ff7a1a]/15 via-[#ff7a1a]/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[300px] bg-[#ff7a1a]/5 blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="border-b border-white/[0.08] bg-[#0c0c0c]/80 backdrop-blur-xl px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1c1c1c] to-[#0e0e0e] border border-[#ff7a1a]/40 flex items-center justify-center font-black text-[#ff7a1a] shadow-lg shadow-[#ff7a1a]/20">
              &#123;V&#125;
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                <span>HACK-O-LANTERN 2026</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#ff7a1a]/20 border border-[#ff7a1a]/40 text-[#ff7a1a]">
                  Finals
                </span>
              </h1>
              <p className="text-[10px] text-neutral-400 font-mono">Mirai Floor • Live Judge Scoring Portal</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-neutral-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Finals Round Active</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="max-w-md w-full space-y-6">
          {/* Card */}
          <div className="bg-[#0f0e13] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-[#ff7a1a]/10 border border-[#ff7a1a]/25 text-[#ff7a1a] mb-1">
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">Judge & Admin Sign In</h2>
              <p className="text-xs text-neutral-400">
                Score the Top 10 Finalist teams across the 5 core parameters.
              </p>
            </div>

            {error && (
              <div className="p-3 mb-5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Username or PIN
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. judge1, judge2, judge3 or 1001"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-[#16141f] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff7a1a] focus:ring-1 focus:ring-[#ff7a1a]/30 transition-all font-mono"
                  />
                  <UserCheck className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Password or PIN
                  </label>
                  <span className="text-[10px] text-neutral-500 font-mono">judge1@hack2026 or PIN</span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter password or 4-digit PIN"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    className="w-full bg-[#16141f] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff7a1a] focus:ring-1 focus:ring-[#ff7a1a]/30 transition-all font-mono"
                  />
                  <KeyRound className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#ff7a1a] hover:bg-[#e5680d] text-black font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-[#ff7a1a]/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter Scoring Desk</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Login Presets */}
            <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Quick Access (3 Judges & Admin)
                </span>
                <span className="text-[10px] text-neutral-500">Tap to auto-sign in</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {PRESET_ACCOUNTS.map((preset) => (
                  <button
                    key={preset.username}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="p-2.5 rounded-xl bg-[#14121c] hover:bg-[#1a1726] border border-white/5 hover:border-[#ff7a1a]/40 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white group-hover:text-[#ff7a1a]">
                        {preset.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-neutral-400 font-mono">
                        PIN: {preset.pin}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      User: <strong className="text-neutral-400">{preset.username}</strong>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] text-neutral-500 font-mono">
            Top 10 Finalist Evaluation • 5 Parameters • Max 50 pts (10 pts each)
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#090909] px-4 py-3 text-center text-[11px] text-neutral-500 font-mono">
        HACK-O-LANTERN 2026 • MSOT & Vulcan Club • Mirai Floor
      </footer>
    </div>
  );
}
