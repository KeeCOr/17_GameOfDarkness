# ChessSummon Next Improvement Instruction

Date: 2026-06-24

## Goal
Turn the current biggest project issue into a small, executable improvement batch. This file is intentionally scoped so the next worker can start without rereading the whole workspace audit.

## Instructions
1. Clarify the board loop in one screen: summon, move, attack, and victory condition should read without opening help.
2. Prioritize action feedback for optional summon, move preview, capture result, and match-end result.
3. Continue bitmap replacement of runtime SVG/code-drawn result or board visuals when those screens are touched.

## Completion Rules
- Do not include discarded projects in this batch.
- If gameplay, UI, systems, content, controls, build behavior, or project scope changes, update the project planning document and update log before build/release.
- If runtime source changes, run the nearest available validation and then perform the required build/package step from the project instructions.
- If a folder or asset looks ambiguous, document the decision instead of deleting it.


## Completed 2026-06-30 v0.5.0

- Clarified the board loop in one screen by showing summon, move/capture, and victory condition copy in the top HUD at player turn start.
- Kept the existing action feedback banner and bitmap HUD resources; no new runtime SVG/code-drawn result visual was added.
- Added ActionFeedback contract tests for board-loop copy and UIScene wiring.

## Completed 2026-06-30 v0.6.0

- Layered action-result feedback into the existing HUD banner for summon, move, capture, check pressure, mana delta, and remaining action choice.
- Rewrote ActionFeedback output copy as short ASCII tactical strings to avoid the prior mojibake ambiguity in runtime feedback.
- Added ActionFeedback contract coverage for three detailed result outcomes and kept full test suite green.