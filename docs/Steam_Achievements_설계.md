# ChessSummon Steam 업적 설계

작성일: 2026-06-01
대상 버전: v0.1.32

## 목표

1차 Steam 출시 후보 빌드에서 Steamworks App Admin에 입력할 업적과 스탯 이름을 미리 고정한다. 실제 Steam API 연동은 다음 단계에서 `SteamService` 계층으로 붙인다.

Steam 공식 문서 기준 업적과 스탯은 Steamworks App Admin에서 먼저 정의하고, 게임 실행 중 `ISteamUserStats` 계열 API로 현재 스탯을 요청하고 업적/스탯을 저장한다.

참고:
- https://partner.steamgames.com/doc/features/achievements
- https://partner.steamgames.com/doc/api/ISteamUserStats

## 스탯 정의

| API Name | Type | 용도 |
| --- | --- | --- |
| `STAT_GAMES_PLAYED` | `INT` | 전체 플레이 수 |
| `STAT_GAMES_WON` | `INT` | 전체 승리 수 |
| `STAT_HARD_WINS` | `INT` | 어려움 승리 수 |
| `STAT_WIN_STREAK` | `INT` | 현재 연승 |
| `STAT_FASTEST_WIN_SECONDS` | `INT` | 가장 빠른 승리 시간 |
| `STAT_SUMMONS_TOTAL` | `INT` | 누적 소환 수 |
| `STAT_CAPTURES_TOTAL` | `INT` | 누적 처치 수 |
| `STAT_PROMOTIONS_TOTAL` | `INT` | 누적 승급 수 |
| `STAT_CHECKS_GIVEN` | `INT` | 누적 체크 수 |

## 업적 정의

| API Name | 한국어 이름 | 영어 이름 | 해금 조건 |
| --- | --- | --- | --- |
| `ACH_TUTORIAL_COMPLETE` | 소환술 입문 | Summoner Initiate | 튜토리얼 완료 |
| `ACH_FIRST_SUMMON` | 첫 소환 | First Summon | 첫 말 소환 |
| `ACH_FIRST_CAPTURE` | 첫 전리품 | First Trophy | 첫 적 말 처치 |
| `ACH_FIRST_CHECK` | 왕을 겨누다 | King in Sight | 첫 체크 |
| `ACH_FIRST_PROMOTION` | 승급의 빛 | Light of Promotion | 첫 병사 승급 |
| `ACH_FIRST_WIN` | 첫 승리 | First Victory | 첫 승리 |
| `ACH_EASY_WIN` | 시야를 밝히는 자 | Bright-Eyed Tactician | 쉬움 승리 |
| `ACH_MEDIUM_WIN` | 전장의 균형 | Balance of Battle | 보통 승리 |
| `ACH_HARD_WIN` | 어려움 정복 | Hard Mode Conqueror | 어려움 승리 |
| `ACH_FAST_WIN` | 3분의 지휘관 | Three-Minute Commander | 60초 이상 남기고 승리 |
| `ACH_WIN_STREAK_3` | 세 번의 흐름 | Threefold Momentum | 3연승 |
| `ACH_SUMMON_ALL_PIECE_TYPES` | 완성된 소환진 | Complete Summoning Circle | 한 판에서 기사, 주교, 룩, 여왕 모두 소환 |

## 설계 원칙

- 1차 출시 업적은 모두 싱글 플레이/튜토리얼에서 달성 가능하게 둔다.
- 온라인 매칭, 랭크전, 시즌 업적은 Phase 3 이후로 미룬다.
- 업적 API Name은 `ACH_` 접두사를 사용하고, 스탯 API Name은 `STAT_` 접두사를 사용한다.
- 아이콘은 `docs/ChessSummon_UI_리소스_목록.md`의 브랜드/랭크/이펙트 리소스 방향을 이어서 제작한다.

## 코드 위치

- 업적/스탯 정의: `src/game/achievements.js`
- 검증 테스트: `tests/AchievementsCatalog.test.js`
