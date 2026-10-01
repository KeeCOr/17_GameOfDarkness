# ChessSummon 업데이트 내역서

## 2026-09-23 v0.8.2 결과→다음 전투 피드백
- 격차: 결과 화면은 MMR 변화만 강조해 패배·승리 원인을 다음 소환 또는 편성 판단으로 연결하지 못했다.
- 변경: 종료 시 남은 마나, 소환 횟수, 양측 잔존 전력을 `battleSummary`로 전달하고 결과 화면에 `다음 전투` 행동 한 가지를 표시한다.
- 판단 규칙: 시간패는 첫 소환 고정, 주력 소환 없음은 기사·주교 우선, 전력 열세는 병사 거점 보존, 승리는 가장 많이 사용한 주력 소환 유지로 요약한다.
- UI: 기존 다크 네이비·금색 프레임, 트로피, MMR 계층과 버튼을 유지하고 결과 프레임의 세로 공간만 확장했다. 새 이미지 자산은 없다.
- 소스 계보: 현재 복원 소스는 v0.8.2이며 Drive에는 `17_ChessSummon_v1.1.0_portable.exe`만 있다. 실행파일을 현재 소스보다 최신인 소스 계보로 간주하거나 덮어쓰지 않았다.
- 변경 파일: `src/game/resultTacticalPlan.js`, `src/scenes/GameScene.js`, `src/scenes/ResultScene.js`, 관련 테스트, package 버전, GDD·기획서·업데이트 내역 MD/HTML.
- 검증: 집중 3개 파일/44개 테스트, 전체 38개 파일/225개 테스트, `npm run build` 통과. Impeccable detect 0건.
- 미실행: `npm run dist`, 루트 실행파일 교체, Drive 배포, 통합 현황 수정.
- 미검증: 실제 전투 완주 후 결과 화면, 450×800 줄바꿈·겹침, 저장 복귀, Steam 클라이언트.
- 알려진 경고: Vite 약 1.59MB JavaScript 청크가 500kB를 초과한다.

## 2026-09-22 v0.8.1 이동 위험도 보드 미리보기
- 격차: 기존 이동 후보는 이동/처치 여부만 보여 목적지의 전술 위험을 선택 전에 비교하기 어려웠다.
- 예시 화면: `docs/design-references/2026-09-22-move-threat-board-preview.png`.
- 선택 이유: 새 시스템을 늘리지 않고 기존 핵심 루프의 판단 품질을 바로 높이는 작은 개선이다.
- 레이아웃: 기존 5×5 보드의 이동 하이라이트 레이어와 기존 HUD 피드백 스트립을 유지했다.
- 컴포넌트: `buildMoveThreatPreviews`, `GameScene._showMovePredictionLayer`, `GameScene._showMovePreviewFeedback`, 기존 action feedback 배너로 분해했다.
- 데이터/상호작용: 보드 복제본, MoveCalculator, 선택 좌표, 합법 이동, 소유자, 공격자·방어자 수, 포획 여부를 사용한다. 아군 말을 선택하면 목적지별 `안전`·`교환`·`위험`과 압축 요약이 표시되며 기존 취소 동작은 유지된다.
- 상태: 기본 상태는 모든 합법 이동 태그 표시, 빈 상태는 기존 `이동 가능한 칸 없음` 피드백을 사용한다. 계산은 로컬 동기 처리라 별도 로딩·네트워크 오류 상태가 없다. 긴 문구는 기존 26자 제한 안의 압축형이며 450×800 좁은 화면은 미검증이다.
- 변경 파일: `src/game/moveThreatPreview.js`, `src/scenes/GameScene.js`, `src/ui/actionFeedback.js`, 관련 테스트, `package.json`, `package-lock.json`, 문서와 예시 이미지.
- 검증: 집중 테스트 23개 통과, 전체 37개 파일/220개 테스트 통과, `npm run build` 통과, UI 정적 검사 0건, `npm run dist` 통과. `ChessSummon_v0.8.1_portable.exe`를 release와 프로젝트 루트에 배치했다.
- 알려진 문제: 실제 플레이 화면·450×800·저장 복귀·Steam 클라이언트 수동 QA는 미검증이다. Vite가 약 1.59MB 청크 경고를 표시한다.
- 다음 후보: 같은 보드 미리보기에 소환 기여도와 소환 전후 왕 위협 변화를 통합한다.

## 2026-07-01 v0.6.1 Checkmate Final Vision Reveal
- 체크메이트를 결정한 마지막 수 직후 전체 보드 시야를 밝히도록 개선했다.
- 결과 화면 전환 전에 기존 fog 오브젝트를 제거하고 모든 칸/말을 다시 렌더링한다.
- 패배한 왕 위치를 중심으로 FINAL VISION 라벨, 보드 라이트 스윕, 스파크, 기존 CHECKMATE 플레이트가 이어지는 특수 연출을 추가했다.
- GameScene 테스트 3개를 추가해 체크메이트 reveal 이벤트, 전체 칸 visible 처리, reveal 중 fog 재생성 금지를 검증했다.

## 2026-06-30 v0.6.0 Action Result Layer Feedback
- Persona feedback target: summon, move, capture, check, and mana changes should read as one action-result chain.
- Replaced action feedback copy with short ASCII tactical layers to avoid prior encoding ambiguity and improve scan speed.
- Added result layers for summon mana delta, captured piece type, check pressure, no-capture moves, and remaining action choice.
- Wired GameScene payloads to send `manaBefore`, `manaAfter`, `capturedPieceType`, and `gaveCheck` to the HUD action banner.
- Added/updated ActionFeedback tests for move preview, summon preview, board-loop copy, and three detailed result outcomes.
## 2026-06-30 v0.5.0 보드 루프 HUD
- 플레이어 턴 시작 시 상단 HUD action feedback에 1 소환 선택 → 2 이동/처치 → 승리: 적 왕 격파를 표시한다.
- ActionFeedback 테스트에 보드 루프 문구와 UIScene 연결 계약을 추가했다.
- 기존 PNG/bitmap HUD 리소스를 유지하고 새 이미지는 추가하지 않았다.


## 2026-06-29 v0.4.0 소환 후보 피드백
- 소환 카드 선택 직후 HUD에 소환 가능 칸 수를 표시하도록 개선했다.
- 이동 전 소환 모드에서는 "이동 1회 남음", 이동 후 소환 모드에서는 "소환 후 턴 종료"를 안내한다.
- 기존 소환 하이라이트 리소스를 유지하고, 새 이미지는 추가하지 않았다.

## 2026-06-29 v0.3.0 이동 후보 피드백
- 말 선택 직후 HUD에 이동 후보 칸 수와 처치 후보 칸 수를 표시하도록 개선했다.
- 이동 후보가 없는 말은 "이동 가능한 칸 없음" 안내로 다른 말 선택을 유도한다.
- 기존 `public/assets/ui` 이동 하이라이트 리소스를 유지하고, 새 이미지는 추가하지 않았다.

## 2026-06-24 문서 구조 정리
- 기획서와 업데이트 내역서를 분리했다.
- 기획서는 게임 소개, 핵심 루프, MVP 가설, KPI, UX 원칙 중심으로 재작성했다.
- 변경 이력, 구현 로그, 검증 기록은 이 문서에서 관리한다.

## 기존 문서에서 분리한 이력 후보
- ChessSummon 기획서 v0.2.35
- 버전: v0.2.35
- 최종 업데이트: 2026-06-23
- 플랫폼: PC Windows, Steam 출시 후보
- 업데이트 내역: ChessSummon_업데이트_내역서.md
- Steam 출시 후보 기준으로 업적, 리더보드, Cloud 저장, Electron portable 빌드, smoke 검증 경로를 갖춘다.
- portable 실행파일 smoke 검증
- 가설검증 방법현재 상태
- 5x5 보드와 한 턴 2행동 구조는 10분 안쪽의 압축 전술 재미를 만든다.한 판 평균 시간, 재시작률, 수동 QA구현됨, 수동 QA 필요
- 마나 소환은 체스 규칙을 모르는 유저에게도 명확한 성장/역전 수단으로 작동한다.소환 사용률, 소환 후 승률 변화, 튜토리얼 이탈률구현됨
- 즉시 피드백 HUD와 PNG 전투 FX는 행동 결과 이해도를 높인다.첫 판 중 행동 착오 수, 캡처/승급 인지 여부v0.2.34 개선됨
- MMR 결과 화면은 반복 플레이 동기를 만든다.패배 후 재도전률, MMR 상승 목표 언급구현됨
- Steam 업적/리더보드는 출시 후 장기 목표로 작동한다.업적 달성률, 리더보드 등록률설계/연동 준비됨
- 첫 판 튜토리얼 완료율: 70% 이상
- Steam 출시 전 필수 수동 QA 체크리스트 통과율: 100%
- Steam 빌드 smoke 검증 성공률: 릴리스 후보마다 100%
- 출시 후보 기준
- 루트, release, Google Drive 실행파일 해시 일치
- ChessSummon 업데이트 내역서

## 작성 규칙
- 기능 추가, 밸런스 변경, UI/UX 수정, 리소스 교체, 빌드/배포 변경은 날짜와 버전을 함께 기록한다.
- 기획서에는 최신 소개와 현재 설계 의도만 남기고, 과거 작업 로그는 이 문서로 이동한다.
- MD와 HTML은 항상 함께 갱신한다.
