import { NextResponse } from 'next/server';
import { requireJudge } from '@/lib/auth';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireJudge();

    // Query top 10 finalist teams joined with this judge's score
    const res = await query(
      `
      SELECT 
        ft.team_id,
        ft.team_name,
        ft.rank_seed,
        ft.prelim_score,
        ft.track_number,
        ft.problem_statement,
        js.param_innovation,
        js.param_technical,
        js.param_implementation,
        js.param_uiux,
        js.param_presentation,
        js.total_score,
        js.feedback,
        js.updated_at as scored_at
      FROM finalist_teams ft
      LEFT JOIN final_judge_scores js 
        ON ft.team_id = js.team_id AND js.judge_username = $1
      ORDER BY ft.rank_seed ASC
      `,
      [session.username]
    );

    const teams = res.rows.map((r) => {
      const hasScore = r.total_score !== null && r.total_score !== undefined;
      return {
        teamId: r.team_id,
        teamName: r.team_name,
        rankSeed: r.rank_seed,
        prelimScore: r.prelim_score !== null ? Number(r.prelim_score) : null,
        trackNumber: r.track_number,
        problemStatement: r.problem_statement,
        isScored: hasScore,
        score: hasScore
          ? {
              param_innovation: Number(r.param_innovation) || 0,
              param_technical: Number(r.param_technical) || 0,
              param_implementation: Number(r.param_implementation) || 0,
              param_uiux: Number(r.param_uiux) || 0,
              param_presentation: Number(r.param_presentation) || 0,
              total: Number(r.total_score) || 0,
              feedback: r.feedback || '',
              scoredAt: r.scored_at,
            }
          : null,
      };
    });

    const scoredCount = teams.filter((t) => t.isScored).length;

    return NextResponse.json({
      ok: true,
      judge: {
        username: session.username,
        displayName: session.displayName,
        role: session.role,
      },
      stats: {
        totalTeams: teams.length,
        scoredCount,
        pendingCount: teams.length - scoredCount,
        progressPercent: Math.round((scoredCount / (teams.length || 1)) * 100),
      },
      teams,
    });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Judge teams error:', err);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

