'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Award,
  Download,
  RefreshCw,
  LogOut,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Search,
  ExternalLink,
} from 'lucide-react';
import { EVALUATION_PARAMETERS } from '@/lib/constants';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [search, setSearch] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  async function loadMatrix() {
    try {
      const res = await fetch('/api/admin/matrix');
      if (res.status === 403 || res.status === 401) {
        router.replace('/login');
        return;
      }
      const json = await res.json();
      if (json.ok) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load matrix:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatrix();
    if (!autoRefresh) return;
    const interval = setInterval(loadMatrix, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  }

  // Re-sync Top 10 from live leaderboard
  async function handleSyncTop10() {
    if (!confirm('Re-sync Top 10 Finalist teams from live leaderboard calculations?')) return;
    setSyncing(true);
    setActionMessage('');
    try {
      const res = await fetch('/api/admin/sync-top10', { method: 'POST' });
      const json = await res.json();
      if (json.ok) {
        setActionMessage(json.message);
        await loadMatrix();
      } else {
        alert(json.error || 'Failed to sync');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSyncing(false);
    }
  }

  // Export to CSV
  function exportCSV() {
    if (!data?.standings) return;
    const judges = data.judges || [];

    const headers = [
      'Final Rank',
      'Team ID',
      'Team Name',
      'Track Number',
      'Problem Statement',
      ...judges.map((j) => `${j.displayName} (Total /50)`),
      'Final Average (/50)',
      'Normalized Average (/10)',
      'Evaluated Judges Count',
    ];

    const rows = data.standings.map((t) => [
      t.finalRank ?? '—',
      `"${t.teamId}"`,
      `"${t.teamName.replace(/"/g, '""')}"`,
      t.trackNumber ?? '',
      `"${(t.problemStatement || '').replace(/"/g, '""')}"`,
      ...judges.map((j) => t.scoresByJudge?.[j.username]?.total ?? 'N/A'),
      t.averages.total,
      t.averages.outOf10,
      `${t.scoredJudgesCount}/${t.totalJudgesCount}`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HACK-O-LANTERN-Finals-Results-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filteredStandings = useMemo(() => {
    if (!data?.standings) return [];
    if (!search.trim()) return data.standings;
    const q = search.toLowerCase();
    return data.standings.filter(
      (t) =>
        t.teamName.toLowerCase().includes(q) ||
        t.teamId.toLowerCase().includes(q) ||
        (t.problemStatement && t.problemStatement.toLowerCase().includes(q))
    );
  }, [data, search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-[#ff7a1a] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-neutral-400">Loading Master Scoring Matrix...</p>
      </div>
    );
  }

  const { stats, judges = [] } = data || {};

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col justify-between selection:bg-[#ff7a1a]/30 relative overflow-x-hidden">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-[#ff7a1a]/15 via-[#ff7a1a]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="border-b border-white/[0.08] bg-[#0c0c0c]/90 backdrop-blur-xl sticky top-0 z-30 px-4 py-3 sm:py-4 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#1c1c1c] to-[#0e0e0e] border border-[#ff7a1a]/40 flex items-center justify-center font-black text-[#ff7a1a] shadow-lg shadow-[#ff7a1a]/20">
              &#123;V&#125;
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xs sm:text-sm font-black uppercase tracking-tight text-white">
                  HACK-O-LANTERN 2026
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-500/50 text-purple-300">
                  Admin Master Desk
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-mono">
                Consolidated 3-Judge Master Scoring Matrix & Winner Standings
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 flex-wrap">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
                autoRefresh
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-neutral-400'
              }`}
              title="Toggle 5s live polling"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span>{autoRefresh ? 'Live Sync ON' : 'Paused'}</span>
            </button>

            <button
              onClick={exportCSV}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleSyncTop10}
              disabled={syncing}
              className="px-3 py-1.5 rounded-xl bg-[#ff7a1a]/20 hover:bg-[#ff7a1a]/30 border border-[#ff7a1a]/40 text-[#ff7a1a] text-xs font-bold transition-all disabled:opacity-50"
            >
              {syncing ? 'Syncing...' : 'Re-sync Top 10'}
            </button>

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
      <main className="max-w-6xl w-full mx-auto px-4 py-6 flex-1 space-y-6">
        {actionMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[#0f0e15] border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-neutral-400 uppercase">Finalist Teams</span>
            <div className="text-2xl font-black text-white font-mono">{stats?.totalTeams || 10}</div>
            <span className="text-[10px] text-neutral-500">Top 10 from prelim rounds</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f0e15] border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-neutral-400 uppercase">Active Judges</span>
            <div className="text-2xl font-black text-[#ff7a1a] font-mono">{judges.length || 3}</div>
            <span className="text-[10px] text-neutral-500">judge1, judge2, judge3</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f0e15] border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-neutral-400 uppercase">Submissions Done</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {stats?.totalSubmissionsReceived} / {stats?.totalSubmissionsExpected}
            </div>
            <span className="text-[10px] text-neutral-500">{stats?.completionPercent}% complete</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f0e15] border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-neutral-400 uppercase">Max Score</span>
            <div className="text-2xl font-black text-white font-mono">50.0 pts</div>
            <span className="text-[10px] text-neutral-500">5 params × 10 pts</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-[#ff7a1a]" />
            <span>Master Standings & Score Matrix</span>
          </h2>

          <div className="relative w-64">
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

        {/* Master Standings Table */}
        <div className="bg-[#0e0d14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#14121d] border-b border-white/10 text-neutral-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3 text-center w-12">Rank</th>
                  <th className="py-3 px-3">Team Details</th>
                  {judges.map((j) => (
                    <th key={j.username} className="py-3 px-3 text-center">
                      {j.displayName} (/50)
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center font-bold text-[#ff7a1a]">Final Avg (/50)</th>
                  <th className="py-3 px-3 text-center font-bold text-white">Score (/10)</th>
                  <th className="py-3 px-3 text-center w-24">Status</th>
                  <th className="py-3 px-3 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredStandings.map((team, idx) => {
                  const isTop1 = team.finalRank === 1;
                  const isTop2 = team.finalRank === 2;
                  const isTop3 = team.finalRank === 3;
                  const isExpanded = expandedTeamId === team.teamId;

                  return (
                    <tr
                      key={team.teamId}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        isTop1 ? 'bg-[#ff7a1a]/5' : ''
                      }`}
                    >
                      <td colSpan={7 + judges.length} className="p-0">
                        {/* Summary Row */}
                        <div
                          onClick={() => setExpandedTeamId(isExpanded ? null : team.teamId)}
                          className="flex items-center py-3.5 px-3 cursor-pointer select-none"
                        >
                          {/* Rank Badge */}
                          <div className="w-12 text-center flex-shrink-0">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs ${
                                isTop1
                                  ? 'bg-[#ff7a1a] text-black shadow-lg shadow-[#ff7a1a]/30'
                                  : isTop2
                                  ? 'bg-neutral-200 text-black'
                                  : isTop3
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-white/5 text-neutral-400 border border-white/5'
                              }`}
                            >
                              {team.finalRank ?? '—'}
                            </span>
                          </div>

                          {/* Team Details */}
                          <div className="flex-1 min-w-[200px] px-3 font-sans">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs font-bold text-[#ff7a1a]">
                                {team.teamId}
                              </span>
                              <span className="font-bold text-white text-sm">
                                {team.teamName}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 line-clamp-1">
                              {team.problemStatement || `Track ${team.trackNumber}`}
                            </p>
                          </div>

                          {/* Judge Columns */}
                          {judges.map((j) => {
                            const jScore = team.scoresByJudge?.[j.username];
                            return (
                              <div
                                key={j.username}
                                className="w-24 text-center px-2 flex-shrink-0"
                              >
                                {jScore ? (
                                  <span className="font-bold text-neutral-200 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                                    {jScore.total.toFixed(1)}
                                  </span>
                                ) : (
                                  <span className="text-neutral-600 text-[11px]">Pending</span>
                                )}
                              </div>
                            );
                          })}

                          {/* Final Avg /50 */}
                          <div className="w-28 text-center px-2 flex-shrink-0">
                            <span className="text-base font-black text-[#ff7a1a]">
                              {team.averages.total > 0 ? team.averages.total.toFixed(2) : '—'}
                            </span>
                            <span className="text-[10px] text-neutral-500 ml-0.5">pts</span>
                          </div>

                          {/* Score /10 */}
                          <div className="w-24 text-center px-2 flex-shrink-0">
                            <span className="font-bold text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                              {team.averages.total > 0 ? team.averages.outOf10.toFixed(2) : '—'}
                            </span>
                          </div>

                          {/* Status */}
                          <div className="w-24 text-center px-2 flex-shrink-0">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                team.isFullyScored
                                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                                  : team.scoredJudgesCount > 0
                                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                                  : 'bg-white/5 border-white/10 text-neutral-500'
                              }`}
                            >
                              {team.scoredJudgesCount}/{team.totalJudgesCount} Scored
                            </span>
                          </div>

                          {/* Expand Icon */}
                          <div className="w-10 text-center flex-shrink-0 text-neutral-500">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 mx-auto" />
                            ) : (
                              <ChevronDown className="w-4 h-4 mx-auto" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Breakdown Drawer */}
                        {isExpanded && (
                          <div className="p-4 bg-[#0a090e] border-t border-b border-white/10 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                                Detailed Parameter Breakdown for {team.teamName} ({team.teamId})
                              </span>
                              <span className="text-[10px] text-neutral-500">
                                Prelim Seed #{team.rankSeed} (Score: {team.prelimScore} pts)
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {judges.map((j) => {
                                const jScore = team.scoresByJudge?.[j.username];
                                return (
                                  <div
                                    key={j.username}
                                    className="p-3.5 rounded-xl bg-[#121118] border border-white/10 space-y-2.5 font-sans"
                                  >
                                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                      <span className="font-bold text-white text-xs">
                                        {j.displayName} ({j.username})
                                      </span>
                                      {jScore ? (
                                        <span className="font-mono text-xs font-black text-emerald-400">
                                          {jScore.total.toFixed(2)} / 50 pts
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-amber-400 font-mono">
                                          Not Scored Yet
                                        </span>
                                      )}
                                    </div>

                                    {jScore ? (
                                      <div className="space-y-1.5 text-[11px] font-mono">
                                        <div className="flex justify-between">
                                          <span className="text-neutral-400">Innovation:</span>
                                          <strong className="text-white">{jScore.param_innovation}/10</strong>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-neutral-400">Technical:</span>
                                          <strong className="text-white">{jScore.param_technical}/10</strong>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-neutral-400">Implementation:</span>
                                          <strong className="text-white">{jScore.param_implementation}/10</strong>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-neutral-400">UI / UX:</span>
                                          <strong className="text-white">{jScore.param_uiux}/10</strong>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-neutral-400">Presentation:</span>
                                          <strong className="text-white">{jScore.param_presentation}/10</strong>
                                        </div>
                                        {jScore.feedback && (
                                          <div className="pt-2 border-t border-white/5 text-[10px] text-neutral-400 italic">
                                            "{jScore.feedback}"
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-[11px] text-neutral-500 py-2">
                                        Awaiting evaluation during live pitch.
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#090909] px-4 py-4 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-2 font-mono">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-neutral-400">HACK-O-LANTERN 2026</span>
            <span>•</span>
            <span>Mirai Floor</span>
            <span>•</span>
            <span>Admin Scoring Desk</span>
          </div>
          <div>All data synced with cloud Postgres database</div>
        </div>
      </footer>
    </div>
  );
}

