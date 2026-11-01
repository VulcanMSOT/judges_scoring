'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  LogOut,
  ChevronRight,
  Sliders,
  Edit3,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Search,
} from 'lucide-react';
import { EVALUATION_PARAMETERS, MAX_POSSIBLE_SCORE } from '@/lib/constants';

export default function JudgeDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalTeams: 10, scoredCount: 0, pendingCount: 10, progressPercent: 0 });
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, scored

  // Active Scoring Modal State
  const [activeTeam, setActiveTeam] = useState(null);
  const [scores, setScores] = useState({
    param_innovation: 7.5,
    param_technical: 7.5,
    param_implementation: 7.5,
    param_uiux: 7.5,
    param_presentation: 7.5,
  });
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Fetch Judge's teams and scores
  async function loadData() {
    try {
      const res = await fetch('/api/judge/teams');
      if (res.status === 401) {
        router.replace('/login');
        return;
      }
      const data = await res.json();
      if (data.ok) {
        setUser(data.judge);
        setStats(data.stats);
        setTeams(data.teams);
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  }

  // Open scoring modal for a team
  function openScorer(team) {
    setActiveTeam(team);
    setSaveError('');
    setSaveSuccess(false);

    if (team.isScored && team.score) {
      setScores({
        param_innovation: team.score.param_innovation,
        param_technical: team.score.param_technical,
        param_implementation: team.score.param_implementation,
        param_uiux: team.score.param_uiux,
        param_presentation: team.score.param_presentation,
      });
      setFeedback(team.score.feedback || '');
    } else {
      // Default initial balanced scores
      setScores({
        param_innovation: 7.0,
        param_technical: 7.0,
        param_implementation: 7.0,
        param_uiux: 7.0,
        param_presentation: 7.0,
      });
      setFeedback('');
    }
  }

  // Calculate live total
  const liveTotal = useMemo(() => {
    const sum =
      (Number(scores.param_innovation) || 0) +
      (Number(scores.param_technical) || 0) +
      (Number(scores.param_implementation) || 0) +
      (Number(scores.param_uiux) || 0) +
      (Number(scores.param_presentation) || 0);
    return Math.round(sum * 100) / 100;
  }, [scores]);

  // Handle saving score
  async function saveScore(advanceNext = false) {
    if (!activeTeam) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/judge/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: activeTeam.teamId,
          ...scores,
          feedback,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save score.');
      }

      setSaveSuccess(true);
      await loadData();

      if (advanceNext) {
        // Find next team
        const currentIndex = teams.findIndex((t) => t.teamId === activeTeam.teamId);
        if (currentIndex !== -1 && currentIndex + 1 < teams.length) {
          setTimeout(() => {
            openScorer(teams[currentIndex + 1]);
          }, 300);
        } else {
          setTimeout(() => setActiveTeam(null), 500);
        }
      } else {
        setTimeout(() => setActiveTeam(null), 600);
      }
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Filtered teams list
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      if (filter === 'scored' && !t.isScored) return false;
      if (filter === 'pending' && t.isScored) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          t.teamName.toLowerCase().includes(q) ||
          t.teamId.toLowerCase().includes(q) ||
          (t.problemStatement && t.problemStatement.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [teams, filter, search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-[#ff7a1a] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-neutral-400">Loading finalist roster...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col justify-between selection:bg-[#ff7a1a]/30 relative overflow-x-hidden">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-[#ff7a1a]/15 via-[#ff7a1a]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="border-b border-white/[0.08] bg-[#0c0c0c]/90 backdrop-blur-xl sticky top-0 z-30 px-4 py-3 sm:py-4 shadow-xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#1c1c1c] to-[#0e0e0e] border border-[#ff7a1a]/40 flex items-center justify-center font-black text-[#ff7a1a] shadow-lg shadow-[#ff7a1a]/20">
              &#123;V&#125;
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xs sm:text-sm font-black uppercase tracking-tight text-white">
                  HACK-O-LANTERN 2026
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff7a1a]/15 border border-[#ff7a1a]/40 text-[#ff7a1a]">
                  Finals Desk
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-mono">
                Top 10 Finalist Evaluation • 5 Parameters (10 pts each)
              </p>
            </div>
          </div>

          {/* User pill & logout */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#14121c] border border-white/10 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">{user?.displayName || 'Judge'}</span>
              <span className="text-neutral-500 text-[10px]">({user?.username})</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-neutral-400 hover:text-red-400 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto px-4 py-6 flex-1 space-y-6">
        {/* Progress Card */}
        <div className="bg-[#0f0e15] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff7a1a] font-bold">
                Evaluation Progress
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{stats.scoredCount} of {stats.totalTeams} Teams Scored</span>
                {stats.scoredCount === stats.totalTeams && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300">
                    All Complete! 🎉
                  </span>
                )}
              </h2>
            </div>

            <div className="flex items-center space-x-4 font-mono text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-neutral-400">Pending: </span>
                <strong className="text-amber-400">{stats.pendingCount}</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-neutral-400">Done: </span>
                <strong className="text-emerald-400">{stats.scoredCount}</strong>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-[#ff7a1a] to-[#ffa95c] h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 bg-[#121118] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-[#ff7a1a] text-black shadow-md shadow-[#ff7a1a]/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Finalists ({teams.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'pending'
                  ? 'bg-[#ff7a1a] text-black shadow-md shadow-[#ff7a1a]/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Pending ({stats.pendingCount})
            </button>
            <button
              onClick={() => setFilter('scored')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'scored'
                  ? 'bg-[#ff7a1a] text-black shadow-md shadow-[#ff7a1a]/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Scored ({stats.scoredCount})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search team ID or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#121118] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff7a1a] transition-all"
            />
          </div>
        </div>

        {/* Finalist Teams List */}
        <div className="space-y-3">
          {filteredTeams.map((team) => {
            return (
              <div
                key={team.teamId}
                onClick={() => openScorer(team)}
                className="p-4 sm:p-5 rounded-2xl bg-[#0e0d14] border border-white/10 hover:border-[#ff7a1a]/40 hover:bg-[#13111b] transition-all cursor-pointer group shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3.5">
                  {/* Seed Rank Badge */}
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-black text-sm text-[#ff7a1a] flex-shrink-0 group-hover:border-[#ff7a1a]/40">
                    #{team.rankSeed}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h3 className="text-base font-black text-white group-hover:text-[#ff7a1a] transition-colors">
                        {team.teamName}
                      </h3>
                      <span className="font-mono text-xs font-bold text-neutral-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                        {team.teamId}
                      </span>
                      {team.prelimScore !== null && (
                        <span className="text-[10px] font-mono text-neutral-400">
                          Prelim: <strong>{team.prelimScore} pts</strong>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-1">
                      {team.problemStatement || `Track ${team.trackNumber || 'General'}`}
                    </p>

                    {team.score?.feedback && (
                      <p className="text-[11px] text-neutral-500 italic flex items-center gap-1 line-clamp-1 pt-0.5">
                        <MessageSquare className="w-3 h-3 flex-shrink-0 text-[#ff7a1a]" />
                        <span>"{team.score.feedback}"</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Score Status & Action */}
                <div className="flex items-center justify-between sm:justify-end space-x-3 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                  {team.isScored ? (
                    <div className="flex items-center space-x-2">
                      <div className="text-right font-mono">
                        <div className="text-xs font-black text-emerald-400 flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{team.score.total.toFixed(2).replace(/\.00$/, '')} / 50 pts</span>
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          Avg: {(team.score.total / 5).toFixed(1)} / 10
                        </div>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold group-hover:bg-emerald-900/50 transition-all flex items-center space-x-1">
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Score</span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Not Scored</span>
                      </span>
                      <span className="px-4 py-1.5 rounded-xl bg-[#ff7a1a] text-black text-xs font-extrabold shadow-md shadow-[#ff7a1a]/25 group-hover:bg-[#e5680d] transition-all flex items-center space-x-1">
                        <span>Score Team</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredTeams.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-[#0e0d14] border border-white/10 text-neutral-500 text-xs">
              No teams match your current filter.
            </div>
          )}
        </div>
      </main>

      {/* Interactive Scoring Modal */}
      {activeTeam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0f0e17] border border-white/15 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 bg-[#14121d] flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-[#ff7a1a] px-2 py-0.5 rounded bg-[#ff7a1a]/15 border border-[#ff7a1a]/30">
                    Finalist #{activeTeam.rankSeed}
                  </span>
                  <span className="font-mono text-xs text-neutral-400">
                    {activeTeam.teamId}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {activeTeam.teamName}
                </h2>
                <p className="text-xs text-neutral-400 line-clamp-1">
                  {activeTeam.problemStatement || `Track ${activeTeam.trackNumber}`}
                </p>
              </div>

              {/* Total Score Badge */}
              <div className="text-right bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 flex-shrink-0">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block font-mono">
                  Calculated Total
                </span>
                <div className="text-2xl font-black text-[#ff7a1a] font-mono tracking-tight leading-none">
                  {liveTotal.toFixed(1)} <span className="text-xs text-neutral-400 font-bold">/ 50</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {(liveTotal / 5).toFixed(1)} / 10 avg
                </span>
              </div>
            </div>

            {/* Error or Success Banner */}
            {saveError && (
              <div className="p-3 bg-red-950/60 border-b border-red-500/40 text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{saveError}</span>
              </div>
            )}
            {saveSuccess && (
              <div className="p-3 bg-emerald-950/60 border-b border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Score saved successfully!</span>
              </div>
            )}

            {/* Modal Body: 5 Parameters */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 divide-y divide-white/5">
              {EVALUATION_PARAMETERS.map((param, index) => {
                const currentVal = scores[param.id] ?? 7.0;
                return (
                  <div key={param.id} className={index > 0 ? 'pt-5 space-y-2.5' : 'space-y-2.5'}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono font-bold flex items-center justify-center text-[#ff7a1a]">
                            {index + 1}
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            {param.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          {param.shortDesc}
                        </p>
                      </div>

                      {/* Score Value Display */}
                      <div className="flex items-center space-x-1.5 font-mono">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="10"
                          value={currentVal}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setScores((prev) => ({
                              ...prev,
                              [param.id]: isNaN(val) ? 0 : Math.min(10, Math.max(0, val)),
                            }));
                          }}
                          className="w-16 bg-[#181622] border border-white/15 focus:border-[#ff7a1a] rounded-xl px-2 py-1 text-center font-bold text-base text-[#ff7a1a] focus:outline-none"
                        />
                        <span className="text-xs text-neutral-500 font-bold">/ 10</span>
                      </div>
                    </div>

                    {/* Range Slider */}
                    <div className="space-y-1 pt-1">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={currentVal}
                        onChange={(e) =>
                          setScores((prev) => ({
                            ...prev,
                            [param.id]: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full cursor-pointer h-2 bg-neutral-800 rounded-lg"
                      />

                      {/* Quick Point Preset Chips */}
                      <div className="flex items-center justify-between pt-1">
                        {[0, 3, 5, 7, 8, 9, 10].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() =>
                              setScores((prev) => ({
                                ...prev,
                                [param.id]: num,
                              }))
                            }
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all ${
                              currentVal === num
                                ? 'bg-[#ff7a1a] text-black shadow'
                                : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Criteria Guidance Bullet Points */}
                    <div className="bg-[#13111a] p-2.5 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block font-mono">
                        Judge Guidance:
                      </span>
                      <ul className="text-[11px] text-neutral-400 space-y-0.5 list-disc list-inside">
                        {param.criteria.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}

              {/* Private Notes / Feedback */}
              <div className="pt-5 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Judge Notes & Comments (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Private remarks, key strengths, weaknesses, or questions answered..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full bg-[#14121d] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff7a1a] transition-all font-mono"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-[#14121d] flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveTeam(null)}
                disabled={saving}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => saveScore(false)}
                  disabled={saving}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Score'}
                </button>

                <button
                  type="button"
                  onClick={() => saveScore(true)}
                  disabled={saving}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#ff7a1a] hover:bg-[#e5680d] text-black text-xs font-extrabold shadow-lg shadow-[#ff7a1a]/25 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <span>{saving ? 'Saving...' : 'Save & Next Team'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#090909] px-4 py-4 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-2 font-mono">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-neutral-400">HACK-O-LANTERN 2026</span>
            <span>•</span>
            <span>Mirai Floor</span>
            <span>•</span>
            <span>Judge Scoring Portal</span>
          </div>
          <div>5 Parameters • Max 50 pts (10 pts per parameter)</div>
        </div>
      </footer>
    </div>
  );
}
