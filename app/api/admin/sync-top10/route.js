import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST() {
  try {
    await requireAdmin();

    const [settingsRes, teamsRes, marksRes, roundsRes] = await Promise.all([
      query('SELECT * FROM settings WHERE id = 1'),
      query(`
        SELECT t.id, t.name, t.status, pss.problem_statement, pss.track_number
        FROM teams t
        LEFT JOIN problem_statement_submissions pss ON t.id = pss.team_id
        ORDER BY t.id ASC
      `),
      query('SELECT team_id, round_number, value FROM marks WHERE removed = FALSE'),
      query('SELECT round_number, label, max_marks, evaluators_per_team, status FROM rounds ORDER BY round_number ASC'),
    ]);

    const settings = settingsRes.rows[0] || {};
    const teams = teamsRes.rows;
    const marks = marksRes.rows;
    const rounds = roundsRes.rows;

    // Compute cumulative scores for all teams
    const teamScores = {};
    for (const t of teams) {
      teamScores[t.id] = {
        teamId: t.id,
        teamName: t.name,
        trackNumber: t.track_number,
        problemStatement: t.problem_statement,
        roundMarks: {},
        cumulativeTotal: 0,
      };
    }

    for (const m of marks) {
      if (teamScores[m.team_id]) {
        if (!teamScores[m.team_id].roundMarks[m.round_number]) {
          teamScores[m.team_id].roundMarks[m.round_number] = [];
        }
        teamScores[m.team_id].roundMarks[m.round_number].push(Number(m.value) || 0);
      }
    }

    // Average per round, then sum
    const teamList = Object.values(teamScores).map((t) => {
      let total = 0;
      for (const rNum of Object.keys(t.roundMarks)) {
        const arr = t.roundMarks[rNum];
        if (arr && arr.length > 0) {
          const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
          total += avg;
        }
      }
      return {
        ...t,
        cumulativeTotal: Math.round(total * 100) / 100,
      };
    });

    teamList.sort((a, b) => b.cumulativeTotal - a.cumulativeTotal);
    const top10 = teamList.slice(0, 10);

    // Upsert into finalist_teams
    for (let i = 0; i < top10.length; i++) {
      const t = top10[i];
      await query(
        `
        INSERT INTO finalist_teams (team_id, team_name, rank_seed, prelim_score, track_number, problem_statement)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (team_id) DO UPDATE SET
          team_name = EXCLUDED.team_name,
          rank_seed = EXCLUDED.rank_seed,
          prelim_score = EXCLUDED.prelim_score,
          track_number = EXCLUDED.track_number,
          problem_statement = EXCLUDED.problem_statement
        `,
        [t.teamId, t.teamName, i + 1, t.cumulativeTotal, t.trackNumber, t.problemStatement]
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Top 10 Finalist teams successfully synced from live leaderboard!',
      count: top10.length,
      top10: top10.map((t, idx) => ({ rankSeed: idx + 1, teamId: t.teamId, teamName: t.teamName, score: t.cumulativeTotal })),
    });
  } catch (err) {
    console.error('Sync top 10 error:', err);
    return NextResponse.json({ error: err.message || 'Failed to sync top 10' }, { status: 500 });
  }
}

