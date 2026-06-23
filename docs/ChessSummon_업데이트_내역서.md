# ChessSummon 업데이트 내역서

- 프로젝트명: ChessSummon / Chess of Dark
- 대상 폴더: `17_DC`
- 현재 버전: `v0.2.35`
- 최종 정리일: 2026-06-23
- 관련 기획서: `ChessSummon_기획서.md`, `ChessSummon_기획서.html`

## 관리 원칙

- 이 문서는 버전별 변경 사항, 테스트, 빌드, 배포 상태를 기록한다.
- 게임 설명과 시스템 설계는 기획서에서 관리하고, 업데이트 히스토리는 이 문서에서 관리한다.
- Steam 출시 준비 blocker는 자동 검증 항목과 수동 QA 항목을 분리해서 추적한다.

## v0.2.35 - Optional Summon Turn Commit

- 플레이어가 이동 후 소환을 하지 않아도 `턴 종료`로 즉시 AI에게 턴을 넘길 수 있음을 HUD 피드백에 명확히 표시했다.
- 행동 피드백 문구를 `소환 선택 가능 / 턴 종료 가능`으로 바꿔 소환이 필수가 아니라 선택임을 알린다.
- 수동 턴 종료 테스트에 `hasMoved=true`, `hasSummoned=false` 상태에서도 턴 종료가 동작하는 회귀 케이스를 추가했다.

## v0.2.34 - Bitmap Combat FX Pass

- 캡처 이펙트의 런타임 `graphics()` 링/슬래시를 `public/assets/fx/capture-impact-ring.png`, `capture-impact-slash.png` 비트맵 FX로 교체했다.
- 승급 이펙트의 런타임 `graphics()` 빔/버스트를 `promotion-beam.png`, `promotion-burst.png` 비트맵 FX로 교체했다.
- 결과 화면 중앙 패널도 `titleButtonFrame` PNG 프레임 우선 렌더링으로 바꿔 벡터 도형 느낌을 줄였다.
- `VisualTheme.test.js`에 캡처/승급 FX가 PNG 자산을 쓰는지, 기존 `graphics()` 구현으로 되돌아가지 않는지 검증하는 회귀 테스트를 추가했다.
- 검증: `npm test` 34 files / 189 tests 통과, `npm run build:html` 성공, `npm run dist` 성공, `npm run verify:steam-release` smoke 6.0s 통과.
- 산출물 SHA256: `56F07C9DD283D6C58333F43779B08AC4A58C80035EB176953634E391BB535C72`.

## v0.2.33 - UI Button State & Hover Fixes

- PNG 버튼 배경이 있는 상태에서도 `setButtonState`가 투명 hit rect에 stroke를 그리려던 문제를 수정했다.
- 난이도 선택 hover를 `button.bg.setTint()` / `clearTint()` 중심으로 정리해 PNG 버튼의 시각 피드백을 살렸다.
- 배치 화면 준비 버튼 비활성 상태를 PNG 배경 alpha 조절로 표현했다.
- UIScene의 우측 상단 도움말 버튼도 동일한 PNG 액션 버튼 프레임을 사용하도록 정리했다.

## v0.2.32 - UI Frame & Button Rendering Fixes

- `addTextButton`에서 PNG bg가 있을 때 불필요한 rect stroke를 생략해 버튼 위 컬러 테두리 문제를 줄였다.
- 모달/결과 화면 일부 버튼과 패널의 PNG 프레임 적용을 보정했다.
- 결과 화면의 버튼 텍스트 위치를 실제 PNG 프레임에 맞게 조정했다.

## v0.2.31 - AI-Generated Game Assets Full Set

- 체스 말, 보드 타일, 하이라이트, HUD 프레임, 소환 UI, 마나/랭크/브랜드 계열 PNG 자산 세트를 확충했다.
- `public/assets/` 하위에 Steam 출시 후보용 아트 리소스를 정리했다.
- 기존 SVG/런타임 도형 느낌을 줄이기 위해 실제 PNG 자산 중심으로 UI 리소스 로딩 경로를 구성했다.

## v0.2.28 - Check & Checkmate Visual Effects

- 체크 발생 시 화면 플래시, 위험 테두리, 왕 위치 링, CHECK 배너를 추가했다.
- 체크메이트 발생 시 베일, 확장 링, 방사형 스파크, 중앙 CHECKMATE 플레이트를 추가했다.
- 체크메이트 후 결과 화면 전환 시간을 늘려 연출이 끝난 뒤 화면이 전환되도록 조정했다.

## v0.2.27 - MMR-Based First-Turn Order

- 플레이어 MMR과 AI 기준 MMR을 비교해 선공을 정하도록 했다.
- 후공 플레이어에게 시작 마나 +1 보너스를 부여해 선후공 불균형을 보정했다.
- Electron portable 파일명이 package version을 자동 반영하도록 정리했다.

## v0.2.24 - Board and Piece Quality Pass

- 원본 체스 말 PNG를 `public/assets/pieces/source`에 보존했다.
- `scripts/normalize_piece_assets.cjs`로 말 실루엣 크기와 하단 정렬을 재생성할 수 있게 했다.
- 보드 말 그림자를 런타임 ellipse 대신 PNG 그림자로 교체했다.
- 배치 화면도 인게임 보드 타일 PNG를 사용하도록 맞췄다.

## v0.2.23 - Action Feedback & In-Game Skin Replacement

- 이동, 캡처, 소환 후 HUD에 즉시 행동 피드백을 표시하도록 했다.
- 보드 셀, 안개 셀, 이동/선택/위협/소환 하이라이트, 마나 크리스탈, 시계 칩을 PNG 스킨으로 교체했다.
- SVG 파일뿐 아니라 런타임 도형으로 만든 SVG-like primitive까지 점검하는 기준을 세웠다.

## 남은 Steam 출시 준비 항목

| 분류 | 항목 | 상태 |
|------|------|------|
| Steamworks | Steam App ID 지정 | 수동 준비 필요 |
| Store Page | 캡슐 이미지 세트 | 수동 준비 필요 |
| Store Page | 스크린샷 세트 | 수동 준비 필요 |
| Store Page | 트레일러/짧은 플레이 영상 | 수동 준비 필요 |
| Manual QA | 싱글플레이 전체 플로우 | 수동 QA 필요 |
| Manual QA | 튜토리얼 플로우 | 수동 QA 필요 |
| Manual QA | 재시작/리플레이 | 수동 QA 필요 |
| Manual QA | Steam overlay | Steam 클라이언트 환경 QA 필요 |
