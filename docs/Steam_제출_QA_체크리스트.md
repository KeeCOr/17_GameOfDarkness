# Chess of Dark Steam 제출 QA 체크리스트

최종 갱신: 2026-06-22

이 문서는 Steam 제출 직전에 반복 확인할 항목을 한 곳에 모은다. 코드에서는 `src/steam/releaseReadiness.js`의 `getSteamReleaseReadiness()`가 같은 기준으로 현재 준비 상태를 요약한다.

## 1. 빌드 산출물

- `ChessSummon_v{version}.html`
- `ChessSummon_v{version}_portable.exe`
- `release/ChessSummon_v{version}_portable.exe`
- 루트 실행파일과 `release` 실행파일 SHA256 해시 일치
- 포터블 실행파일 6초 이상 기동 확인

## 2. Steamworks 외부 설정

- Steam App ID 확정
- Steamworks 테스트 계정에서 앱 실행 가능
- Steam Overlay 동작 확인
- Steam Cloud Auto-Cloud 경로: `%APPDATA%\ChessSummon\SaveData`
- 업적 API 이름 12개 등록
- 스탯 API 이름 9개 등록
- 리더보드 `RANK_POINTS` 등록

## 3. 스토어 자료

- 세부 제작 기준: `docs/Steam_스토어_제출_패키지.md`
- 헤더/캡슐/라이브러리 이미지 세트
- 시작 화면, 인게임, 승리/패배, 난이도 선택 스크린샷
- 15-30초 짧은 게임플레이 영상 또는 트레일러
- 한국어/영어 스토어 설명
- 광고 없음, 싱글 플레이 중심 1차 출시 범위 명시

## 4. 수동 QA

- 이동/처치/소환 직후 상단 HUD 액션 피드백 배너가 보드/시계/소환 카드와 겹치지 않는지 확인

- 싱글 플레이 쉬움/보통/어려움 시작 및 종료
- 어려움 승리 후 매우 어려움 해금
- 튜토리얼 완료
- 다시하기 3회 반복
- 시간 초과 패배 문구
- 체크/체크메이트 연출
- Steam 랭킹 조회 실패 시 오프라인 fallback 표시

## 5. 현재 자동 체크 범위

- `npm run verify:steam-release`로 현재 버전 산출물, portable SHA256 일치, 6초 스모크 기동을 자동 확인

- 현재 버전 기반 파일명 계산
- 업적 카탈로그 수량과 Steam API 이름 검증
- 스탯 카탈로그 존재 검증
- `RANK_POINTS` 리더보드 카탈로그 검증
- 외부 스토어/Steamworks/수동 QA 항목 미완료 상태를 blocker로 분리
