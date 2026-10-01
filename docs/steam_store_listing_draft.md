# ChessSummon (Chess of Dark) — Steam 스토어 페이지 문안 초안

작성일: 2026-09-21
근거: `docs/ChessSummon_GDD.md` (문서 버전 2.0, 2026-09-16 코드 동기화), `src/steam/storeAssets.js`

> 이 문서는 텍스트 문안만 다룬다. 실제 캡슐/스크린샷/트레일러 이미지 제작은 별도 진행해야 한다(아래 "필요 이미지 자산" 참고). App ID 발급과 Steamworks 파트너 등록은 사용자의 Steam 계정으로 직접 진행해야 하는 외부 절차라 이 문서에 포함하지 않는다.

## 게임명 후보

- **ChessSummon** (부제: *Chess of Dark*)
- 국문 표기: 체스 서몬 — 어둠의 체스

## 짧은 설명 (한 줄, 스토어 검색 결과용)

> 5×5 보드에서 마나로 말을 소환하고, 이동·포획·체크를 조합해 상대 왕을 무너뜨리는 밀도 높은 다크 판타지 전술 체스.

## 상세 설명 (About This Game)

**국문**

정통 체스의 무게감은 유지하되, 판은 5×5로 줄이고 규칙에 "소환"을 더했습니다. 매 턴 얻는 마나로 자신의 왕 주변에 말을 소환하며 전선을 새로 짜고, 이동·포획·체크 압박을 동시에 굴려 상대 왕을 제거하거나 체크메이트하세요. 한 판에 10~30분, 긴 정통 체스 대국보다 빠르게 전술적 결론이 납니다.

- **소환으로 완성되는 전장**: 고정된 초기 전력 대신, 마나와 소환 순서가 매 판 다른 전선을 만듭니다.
- **작은 보드, 높은 밀도**: 5×5 공간에서 한 칸의 이동이 공격선·왕의 안전·소환 공간을 동시에 바꿉니다.
- **바로 읽히는 수읽기**: MOVE·CAPTURE·SUMMON·CHECK·WIN 단서를 행동 전에 화면에서 바로 확인할 수 있습니다.
- **4단계 AI**와 **싱글 플레이 MMR**, **서버 권위 온라인 대전**과 랭크(Bronze~Master)로 반복 대전의 재미를 확인하세요.
- Steam 업적 10개 이상, 리더보드, 클라우드 랭크 연동 지원.

**영문 (초안, 자연스러운 표현으로 다듬어 사용)**

> A 5×5 chess variant where mana lets you summon pieces around your king mid-battle. Blend movement, capture, and check pressure to break through in 10–30 minutes per match. Features 4 AI difficulty tiers, solo MMR, server-authoritative online play, ranked ladder (Bronze to Master), and Steam achievements/leaderboards.

## 주요 기능 (Feature bullets)

- 5×5 소환형 체스: 마나로 폰/나이트/비숍/룩/퀸을 소환해 매 판 다른 전장을 설계
- 짧은 세션: 대국당 10~30분
- 난이도 4단계(쉬움~매우 어려움) + 튜토리얼 7단계
- 싱글 플레이 MMR(800~1200) 및 랭크(Bronze~Master)
- 서버 권위 실시간 PvP, 매칭 실패 시 랭크 기반 AI 대전 폴백
- Steam 업적 10개 이상, 통계 5개 이상, 랭크 리더보드 연동

## 태그 제안

Chess, Strategy, Turn-Based Strategy, Board Game, Dark Fantasy, PvP, Singleplayer, Indie, Tactical, Difficult

## 시스템 요구사항 초안 (Windows 포터블 Electron 기준 — 실측 후 확정 필요)

| 구분 | 최소 | 권장 |
|---|---|---|
| OS | Windows 10 64-bit | Windows 10/11 64-bit |
| 프로세서 | 듀얼코어 2.0GHz | 쿼드코어 2.5GHz+ |
| 메모리 | 4GB RAM | 8GB RAM |
| 그래픽 | 통합 그래픽 | 통합 그래픽 |
| 저장공간 | 500MB (Electron 패키징 기준 추정) | 500MB |
| 네트워크 | PvP 모드는 인터넷 연결 필요 | — |

*실제 설치 용량은 `npm run dist` 산출물 크기를 확인해 갱신할 것.*

## 필요 이미지 자산 (`src/steam/storeAssets.js` 기준, 아직 전부 미제작)

| 자산 | 크기 | 용도 |
|---|---|---|
| Header Capsule | 920×430 | 스토어 헤더 |
| Small Capsule | 462×174 | 목록 노출 |
| Main Capsule | 1232×706 | 스토어 메인 |
| Vertical Capsule | 748×896 | 발견 큐 |
| Screenshots (16:9, 1920×1080 이상) | — | 최소 5장 권장 (전투 화면, 소환 순간, 체크 경고, 승리 화면, 튜토리얼) |
| Shortcut/App Icon | 256×256 / 184×184 | 클라이언트 아이콘 |
| Library Capsule | 600×900 | 라이브러리 |
| Library Hero | 3840×1240 | 라이브러리 배경 |
| Library Logo | 1280×720 이상, 투명 배경 | 라이브러리 로고 |
| Library Header Capsule | 920×430 | 라이브러리 헤더 |

현재 이미지 생성 파이프라인(`codex-image` 플러그인)이 이 머신에 설치돼 있지 않아 자동 생성이 불가하다 — 플러그인 재설치 또는 외주/직접 제작 필요.

## 남은 외부 절차 (사용자 액션 필요)

1. Steamworks 파트너 등록 + App ID 발급 ($100, 사용자 Steam 계정)
2. 위 이미지 자산 10종 제작
3. 트레일러 영상 제작
4. 실클라이언트 오버레이 수동 QA (App ID 발급 후 가능)
