import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();

    const [teamsRes, scoresRes, judgesRes] = await Promise.all([
      query('SELECT team_id, team_name, rank_seed, prelim_score, track_number, problem_statement FROM finalist_teams ORDER BY rank_seed ASC'),
      query('SELECT judge_username, judge_name, team_id, param_innovation, param_technical, param_implementation, param_uiux, param_presentation, total_score, feedback, updated_at FROM final_judge_scores'),
      query("SELECT username, display_name, pin FROM judge_accounts WHERE role = 'judge' ORDER BY username ASC"),
    ]);

    const judgesList = judgesRes.rows.map((j) => ({
      username: j.username,
      displayName: j.display_name,
      pin: j.pin,
    }));

    // Map scores by team_id and judge_username
    const scoreMap = {};
    for (const s of scoresRes.rows) {
      if (!scoreMap[s.team_id]) {
        scoreMap[s.team_id] = {};
      }
      scoreMap[s.team_id][s.judge_username] = {
        judgeName: s.judge_name,
        param_innovation: Number(s.param_innovation),
        param_technical: Number(s.param_technical),
        param_implementation: Number(s.param_implementation),
        param_uiux: Number(s.param_uiux),
        param_presentation: Number(s.param_presentation),
        total: Number(s.total_score),
        feedback: s.feedback,
        updatedAt: s.updated_at,
      };
    }

    const totalJudgesCount = judgesList.length || 3;

    // Calculate aggregated standing for each team
    let standings = teamsRes.rows.map((team) => {
      const teamScores = scoreMap[team.team_id] || {};
      const judgeEntries = Object.values(teamScores);
      const scoredJudgesCount = judgeEntries.length;

      let avgTotal = 0;
      let avgInnovation = 0;
      let avgTechnical = 0;
      let avgImplementation = 0;
      let avgUiux = 0;
      let avgPresentation = 0;

      if (scoredJudgesCount > 0) {
        const sumTotal = judgeEntries.reduce((acc, curr) => acc + curr.total, 0);
        const sumInn = judgeEntries.reduce((acc, curr) => acc + curr.param_innovation, 0);
        const sumTech = judgeEntries.reduce((acc, curr) => acc + curr.param_technical, 0);
        const sumImp = judgeEntries.reduce((acc, curr) => acc + curr.param_implementation, 0);
        const sumUi = judgeEntries.reduce((acc, curr) => acc + curr.param_uiux, 0);
        const sumPres = judgeEntries.reduce((acc, curr) => acc + curr.param_presentation, 0);

        avgTotal = Math.round((sumTotal / scoredJudgesCount) * 100) / 100;
        avgInnovation = Math.round((sumInn / scoredJudgesCount) * 100) / 100;
        avgTechnical = Math.round((sumTech / scoredJudgesCount) * 100) / 100;
        avgImplementation = Math.round((sumImp / scoredJudgesCount) * 100) / 100;
        avgUiux = Math.round((sumUi / scoredJudgesCount) * 100) / 100;
        avgPresentation = Math.round((sumPres / scoredJudgesCount) * 100) / 100;
      }

      return {
        teamId: team.team_id,
        teamName: team.team_name,
        rankSeed: team.rank_seed,
        prelimScore: team.prelim_score !== null ? Number(team.prelim_score) : null,
        trackNumber: team.track_number,
        problemStatement: team.problem_statement,
        scoredJudgesCount,
        totalJudgesCount,
        isFullyScored: scoredJudgesCount === totalJudgesCount,
        scoresByJudge: teamScores,
        averages: {
          total: avgTotal,
          outOf10: Math.round((avgTotal / 5) * 100) / 100, // normalized to 10
          innovation: avgInnovation,
          technical: avgTechnical,
          implementation: avgImplementation,
          uiux: avgUiux,
          presentation: avgPresentation,
        },
      };
    });

    // Sort by Final Average Score descending, then by prelim seed
    standings.sort((a, b) => {
      if (b.averages.total !== a.averages.total) {
        return b.averages.total - a.averages.total;
      }
      return (b.prelimScore || 0) - (a.prelimScore || 0);
    });

    // Assign final rank
    standings = standings.map((item, index) => ({
      finalRank: item.scoredJudgesCount > 0 ? index + 1 : null,
      ...item,
    }));

    const totalSubmissionsExpected = standings.length * totalJudgesCount;
    const totalSubmissionsReceived = scoresRes.rows.length;

    return NextResponse.json({
      ok: true,
      judges: judgesList,
      stats: {
        totalTeams: standings.length,
        totalJudges: totalJudgesCount,
        totalSubmissionsExpected,
        totalSubmissionsReceived,
        completionPercent: Math.round((totalSubmissionsReceived / (totalSubmissionsExpected || 1)) * 100),
      },
      standings,
    });
  } catch (err) {
    if (err.message.includes('Forbidden') || err.message === 'Unauthorized') {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error('Admin matrix error:', err);
    return NextResponse.json({ error: 'Failed to generate admin matrix' }, { status: 500 });
  }
}

