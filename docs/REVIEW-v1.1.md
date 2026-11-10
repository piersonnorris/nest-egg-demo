# v1.1 design review decisions

Reviewed November 10, 2026. Claude and Gemini were asked independently for concise product/UI guidance using the public demo URL and a description containing only fictional example data. They were asked for review only. Their advice was evaluated before implementation; this is not an independent certification.

## Applied

Both suggested an original Nest Egg video cover, an accessible player with an external YouTube fallback, and keeping investor context in a collapsed section. Claude additionally recommended delaying YouTube loading until Play, restoring focus after closing, preserving the fixed demo date, and protecting shared state against stale copy. These informed the v1.1 implementation.

The user then requested a clearer savings average and a book-icon log. Both reviewers received the updated design description. Historical monthly savings are kept distinct from future per-payday plans and new manual entries. Browser checks verify the actual behavior.

Claude's follow-up recommended comparing the two cadences and exposing the reduced final contribution. The planner now gives the annualized monthly equivalent of a repeated biweekly contribution ($75 × 26 ÷ 12 = $162.50/month), while the goal projection identifies the final $50 contribution. Both reviewers emphasized initial focus, Escape dismissal, and destroying the iframe on close; these behaviors were tested. The opening-balance helper explains the alternate history view, and existing polite live-status messages announce a recorded balance or a changed baseline.

## Corrections and limits

- Gemini suggested an unverified 4m12s video duration and wording implying the real video describes Alex's fictional paycheck. Neither was used. The exact requested title is retained; the adjacent routine is explicitly a set of suggested demo steps, not a transcript summary.
- Gemini suggested lower churn/higher lifetime value as outcomes. No such results have been established, so they are not claimed. Pilot measures are proposals.
- Claude reported reading rendered live-page text, not screenshots, and that its GitHub source fetch was rate limited. Its inferred concerns that student benefits were unwired and the strike-through price was missing were checked against the source and existing UI: both already worked. Its suggested fixes to those were unnecessary.
- Gemini described opening-balance edits as permanently deleting the original history and recommended a confirmation. The underlying monthly history is retained and Reset restores it; this is a reversible in-memory display change. An inline explanation was added without claiming permanent data loss.
- SoFi Coach already has budgeting and goal-planning tools; Nest Egg's proposed contribution is a structured lesson-to-plan experience and school/campus delivery. This is a strategy hypothesis, not demonstrated differentiation.
- Financial account linking, bank transfers, membership verification, and any future SoFi handoff remain outside this static demo.

## Primary reference

[SoFi: What Is SoFi Coach and How Does It Work?](https://www.sofi.com/what-is-sofi-coach-and-how-does-it-work/) — checked November 10, 2026 for the limited budgeting/goal-planning description. Public member-dashboard patterns informed the visual direction; no private financial account data or proprietary product assets are published.
