# ChessSummon Next Improvement Instruction

Date: 2026-09-22

## Goal
Turn the current biggest project issue into a small, executable improvement batch. This file is intentionally scoped so the next worker can start without rereading the whole workspace audit.

## Instructions
1. Clarify the board loop in one screen: summon, move, attack, and victory condition should read without opening help.
2. Prioritize action feedback for optional summon, move preview, capture result, and match-end result.
3. Continue bitmap replacement of runtime SVG/code-drawn result or board visuals when those screens are touched.

## Completed 2026-09-22 v0.8.1

- Implemented the movement portion of project priority 1: every legal destination now reports `안전`, `교환`, or `위험`, while capture destinations retain a distinct `처치` label.
- Added a compact HUD summary and board-derived tests without changing the existing board layout or cancellation controls.
- Created `docs/design-references/2026-09-22-move-threat-board-preview.png` before implementation and recorded the component/state decomposition in the update log.
- Full tests, build, UI static detection, and Windows portable packaging passed. Actual gameplay and 450×800 visual QA remain unverified.

## Next batch

1. Add summon contribution and before/after king-threat delta to the same preview language.
2. Verify tag overlap, contrast, and long Korean copy in an actual 450×800 Electron play session.
3. Keep decisions explanatory; do not auto-recommend a single move.

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

## 2026-09-18 전체 프로젝트 공통 완료 조건

1. **첫 5분 핵심 루프**: 시작 10초 안에 목표가 읽히고, 5분 안에 첫 판단→실행→결과→보상/손실→다음 목표가 한 번 완결되어야 한다.
2. **판단 전후 피드백**: 선택 전 예상 이득·위험·비용, 실행 직후 성공·실패·상태 변화, 결과 화면의 원인·변화·다음 점검 행동을 같은 흐름으로 제공한다. 정답을 자동 추천하지 않는다.
3. **출시 증거 패키지**: 테스트·빌드·첫 5분 수동 확인·대표 실행 화면·로딩/빈 상태/오류/저장 복귀·버전과 검증 날짜를 기록한다. 수행하지 않은 항목은 미검증으로 표시한다.

공통 기준 원문: `C:\Development\_workspace_docs\전체_프로젝트_공통_개선기준_2026-09-18.md`

## 2026-09-18 프로젝트별 고유 개선 3개
> 아래 세 항목은 이 프로젝트의 고유 우선순위다. 구현 후에만 완료로 표시한다.

1. 말 선택 시 이동·공격 위협·소환 기여도를 한 보드에 표시
2. 소환 전후 점유율과 왕 위협 변화를 비교
3. 초반에는 핵심 말과 소환 규칙만 단계적으로 개방
