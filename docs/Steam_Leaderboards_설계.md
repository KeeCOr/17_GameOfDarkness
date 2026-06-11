# ChessSummon Steam 리더보드 설계

작성일: 2026-06-02
대상 버전: v0.1.39

## 목표

1차 Steam 출시에서 공식 랭킹으로 보여줄 리더보드를 최소 범위로 고정한다. 현재 온라인 매칭은 베타 성격이 강하므로, Steam 리더보드는 계정별 랭크 포인트를 표시하는 `RANK_POINTS` 하나로 시작한다.

## 리더보드 정의

| 항목 | 값 |
| --- | --- |
| ID | `rank_points` |
| Steam API Name | `RANK_POINTS` |
| 표시 이름 | `Rank Points` |
| 정렬 | 내림차순 |
| 표시 타입 | 숫자 |
| 업로드 정책 | 최고 점수 유지 |
| 점수 출처 | `account.rankPoints` |

## Steamworks App Admin 입력 기준

- 리더보드 이름은 코드의 `apiName`과 동일하게 `RANK_POINTS`로 입력한다.
- 점수는 높을수록 좋은 랭크 포인트이므로 내림차순 정렬을 사용한다.
- 같은 유저가 여러 번 업로드할 경우 최고 점수를 유지한다.
- 시즌제 리더보드는 1차 출시 범위에서 제외하고, 추후 시즌/월간 랭킹을 추가할 때 별도 API Name을 만든다.

## 코드 위치

- 리더보드 카탈로그: `src/game/leaderboards.js`
- Steam 업로드 호출: `src/services/SteamService.js`
- 업로드 호출 시점: `src/scenes/MultiplayerLobbyScene.js`의 `account` 메시지 수신
- Electron IPC 브릿지: `electron/steamIpc.cjs`
- 검증 테스트: `tests/LeaderboardsCatalog.test.js`, `tests/SteamService.test.js`

## 남은 작업

1. 실제 Steamworks SDK에서 `RANK_POINTS` 핸들을 찾거나 생성하는 구현을 확정한다.
2. 실제 클라이언트 대국 종료 시 `matchResult` 메시지를 서버에 보내는 UI/네트워크 경로를 추가한다.
3. v0.1.87부터 Electron Steam 브릿지는 `downloadLeaderboardEntries`를 제공하며, 멀티플레이 로비는 `RANK_POINTS` 상위 항목 표시 자리를 가진다.
3. Steam 테스트 계정에서 업로드 후 Steam 클라이언트/커뮤니티 표시에 반영되는지 확인한다.
