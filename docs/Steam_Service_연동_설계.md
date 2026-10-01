# ChessSummon SteamService 연동 설계

작성일: 2026-06-02
대상 버전: v0.1.36

## 목표

Steamworks SDK를 설치하기 전에도 게임 로직이 Steam 업적, 스탯, 리더보드 전송 흐름과 같은 인터페이스를 사용하게 만든다. Steam 실행 환경에서는 실제 Steam 클라이언트 어댑터를 주입하고, 일반 HTML/개발 환경에서는 로컬 업적 진행도 저장소를 사용한다.

## 서비스 구조

- `src/services/SteamService.js`: 게임 씬이 호출하는 단일 서비스 계층
- `src/game/achievementProgress.js`: 로컬 업적 해금과 스탯 저장
- `src/game/achievements.js`: Steamworks App Admin에 등록할 업적/스탯 카탈로그
- `electron/steamPreload.cjs`: renderer에 `window.chessSummonSteam` 브릿지 노출
- `electron/steamIpc.cjs`: Steam IPC 채널과 fallback 응답 처리
- `electron/steamClient.cjs`: `STEAM_APP_ID` 기반 optional Steamworks SDK 클라이언트 로딩

## 현재 지원하는 호출

| 메서드 | 역할 |
| --- | --- |
| `recordTutorialComplete()` | 튜토리얼 완료 업적 기록 |
| `recordSummon(pieceType)` | 소환 횟수, 첫 소환, 한 경기 모든 주요 말 소환 기록 |
| `recordCapture()` | 처치 횟수와 첫 처치 기록 |
| `recordCheck()` | 체크 횟수와 첫 체크 기록 |
| `recordPromotion(owner)` | 플레이어 승급만 업적/스탯에 반영 |
| `recordGameOver(result)` | 경기 수, 승리 수, 난이도별 승리, 빠른 승리, 연승 기록 |
| `uploadRankPoints(score)` | Steam 리더보드 `RANK_POINTS` 업로드 어댑터 호출 |

## Steam 클라이언트 어댑터 계약

실제 SDK 연동 시 다음 메서드를 가진 객체를 `createSteamService({ steamClient })`에 전달한다. Electron 빌드에서는 preload가 노출한 `window.chessSummonSteam`을 `SteamService`가 자동 감지한다.

```js
{
  isReady() {},
  setAchievement(apiName) {},
  setStat(apiName, value) {},
  storeStats() {},
  uploadLeaderboardScore(leaderboardName, score) {},
}
```

`isReady()`가 false이거나 어댑터가 없으면 Steam 호출은 하지 않고 로컬 진행도만 저장한다.

## 검증

- `tests/SteamService.test.js`: Steam 없음 fallback, Steam 어댑터 동기화, 리더보드 업로드 어댑터 호출 검증
- `tests/AchievementProgress.test.js`: 로컬 업적 진행도와 저장 검증
- `tests/GameSceneTurnEnd.test.js`: 게임 씬 이벤트와 업적 기록 연결 검증

## 다음 작업

1. Steamworks SDK 패키지와 실제 App ID를 확정한다.
2. `electron/steamClient.cjs`의 `normalizeSteamworksClient()`를 선택한 SDK의 실제 API 형태에 맞춰 조정한다.
3. Steam 테스트 계정으로 업적 해금, 스탯 저장, `RANK_POINTS` 리더보드 업로드를 검증한다.
