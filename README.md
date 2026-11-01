# HACK-O-LANTERN 2026 — Finals Judge Scoring Portal 🎃

Live scoring application for the 3 Judges to evaluate the **Top 10 Finalist Teams** across 5 core hackathon parameters (out of 10 each = 50 max score).

---

## 1. Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Build for production
npm run build

# 3. Start production server (runs on port 3004)
npm start
```

Or for development:
```bash
npm run dev
```

---

## 2. Judge & Admin Credentials

Authentication supports both **Username + Password** or quick **4-digit PIN**:

| Role | Username | Password | PIN | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Judge 1** | `judge1` | `judge1@hack2026` | `1001` | Finalist roster, interactive 5-parameter scoring sliders, feedback notes. |
| **Judge 2** | `judge2` | `judge2@hack2026` | `1002` | Same as above. |
| **Judge 3** | `judge3` | `judge3@hack2026` | `1003` | Same as above. |
| **Admin** | `admin` | `admin@hack2026` | `9999` | 3-judge live master scoring matrix, final average rankings, CSV export. |

> **Pro-Tip**: The login screen features **1-Tap Quick Access Buttons** for each judge and admin to sign in instantly on phones or tablets during live pitches.

---

## 3. The 5 Evaluation Parameters (Max 50 pts)

Each judge evaluates every team on a **0 to 10 scale** across 5 general hackathon criteria:

1. **Innovation & Originality (0 - 10 pts)**:
   - Novelty, creative problem-solving, and uniqueness of approach.
   - Out-of-the-box thinking beyond standard templates/tutorials.
2. **Technical Complexity & Architecture (0 - 10 pts)**:
   - Backend, AI/ML, algorithm rigor, tech stack ambition, and system design depth.
3. **Working Implementation & Demo (0 - 10 pts)**:
   - End-to-end working live prototype, handling edge cases without crashes.
4. **UI / UX & Design Polish (0 - 10 pts)**:
   - Interface responsiveness, intuitive interaction, visual polish, and aesthetic feel.
5. **Impact, Viability & Presentation (0 - 10 pts)**:
   - Problem-solution fit, real-world utility, clear pitch delivery, and answering judge questions.

**Total Score**:
$$\text{Total Score} = \text{P1} + \text{P2} + \text{P3} + \text{P4} + \text{P5} = 50.0\text{ max pts}$$

---

## 4. Top 10 Finalist Teams

Automatically seeded from the live Hack-O-Lantern leaderboard standings:
1. **VHK-1082** — Monarch (Track 3)
2. **VHK-1074** — CodeTitans (Track 3)
3. **VHK-1017** — PromptOPS (Track 2)
4. **VHK-1075** — BAAPUJI (Track 5)
5. **VHK-1076** — Khatarnaak coders (Track 3)
6. **VHK-1063** — ByteCode (Track 3)
7. **VHK-1019** — Pleasure n Punishment (Track 2)
8. **VHK-1033** — COVEN (Track 5)
9. **VHK-1038** — Code Nomads (Track 1)
10. **VHK-1012** — Catalyst (Track 1)

---

## 5. Admin Master Desk (`/admin`)

- **Master Standings**: Live matrix displaying Judge 1, Judge 2, and Judge 3 scores side-by-side.
- **Combined Ranking**: Live sorted rankings based on the average of all 3 judges.
- **Detailed Parameter Breakdown**: Expand any team to view individual criteria ratings and remarks from each judge.
- **CSV Export**: One-click download of the complete final results for prize distribution.
