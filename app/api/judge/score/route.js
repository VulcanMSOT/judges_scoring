import { NextResponse } from 'next/server';
import { requireJudge } from '@/lib/auth';
import { query } from '@/lib/db';

function clampScore(val) {
  const num = Number(val);
  if (isNaN(num)) return 0;
  return Math.min(10, Math.max(0, Math.round(num * 100) / 100));
}

export async function POST(request) {
  try {
    const session = await requireJudge();
    const body = await request.json();

    const {
      teamId,
      param_innovation,
      param_technical,
      param_implementation,
      param_uiux,
      param_presentation,
      feedback,
    } = body;

    const cleanTeamId = String(teamId || '').trim();
    if (!cleanTeamId) {
      return NextResponse.json({ error: 'Team ID is required.' }, { status: 400 });
    }

    // Verify team exists in finalist_teams
    const teamCheck = await query('SELECT team_id, team_name FROM finalist_teams WHERE team_id = $1', [cleanTeamId]);
    if (teamCheck.rows.length === 0) {
      return NextResponse.json({ error: `Team ${cleanTeamId} is not in the Top 10 finalists list.` }, { status: 404 });
    }

    const cInnovation = clampScore(param_innovation);
    const cTechnical = clampScore(param_technical);
    const cImplementation = clampScore(param_implementation);
    const cUiux = clampScore(param_uiux);
    const cPresentation = clampScore(param_presentation);
    const cleanFeedback = String(feedback || '').trim();

    // Upsert score
    const res = await query(
      `
      INSERT INTO final_judge_scores (
        judge_username,
        judge_name,
        team_id,
        param_innovation,
        param_technical,
        param_implementation,
        param_uiux,
        param_presentation,
        feedback,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (judge_username, team_id) DO UPDATE SET
        judge_name = EXCLUDED.judge_name,
        param_innovation = EXCLUDED.param_innovation,
        param_technical = EXCLUDED.param_technical,
        param_implementation = EXCLUDED.param_implementation,
        param_uiux = EXCLUDED.param_uiux,
        param_presentation = EXCLUDED.param_presentation,
        feedback = EXCLUDED.feedback,
        updated_at = NOW()
      RETURNING *
      `,
      [
        session.username,
        session.displayName,
        cleanTeamId,
        cInnovation,
        cTechnical,
        cImplementation,
        cUiux,
        cPresentation,
        cleanFeedback,
      ]
    );

    const saved = res.rows[0];

    return NextResponse.json({
      ok: true,
      message: `Score for ${teamCheck.rows[0].team_name} (${cleanTeamId}) saved successfully!`,
      score: {
        teamId: saved.team_id,
        param_innovation: Number(saved.param_innovation),
        param_technical: Number(saved.param_technical),
        param_implementation: Number(saved.param_implementation),
        param_uiux: Number(saved.param_uiux),
        param_presentation: Number(saved.param_presentation),
        total: Number(saved.total_score),
        feedback: saved.feedback,
        updatedAt: saved.updated_at,
      },
    });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Submit score error:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit score' }, { status: 500 });
  }
}
