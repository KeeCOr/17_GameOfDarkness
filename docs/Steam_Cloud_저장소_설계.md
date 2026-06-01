# ChessSummon Steam Cloud 저장소 설계

작성일: 2026-06-01
대상 버전: v0.1.31

## 목표

Steam 1차 출시 후보 빌드에서 로컬 저장 파일을 Steam Auto-Cloud가 동기화하기 쉬운 위치에 모은다.

## 코드 저장 위치

Windows 기본 저장 폴더:

```text
%APPDATA%\ChessSummon\SaveData
```

현재 클라우드 후보 파일:

```text
rank-points.json
```

QA나 임시 테스트에서는 환경 변수로 저장 위치를 바꿀 수 있다.

```text
CHESSSUMMON_SAVE_DIR=D:\ChessSummonSaves
RANK_FILE=D:\ChessSummonSaves\rank-points.json
```

## Steamworks Auto-Cloud 설정값

Steamworks의 Steam Cloud 설정에서 Auto-Cloud Root Path를 다음처럼 등록한다.

| 항목 | 값 |
| --- | --- |
| Root | `WinAppDataRoaming` |
| Subdirectory | `ChessSummon/SaveData` |
| Pattern | `*.json` |
| OS | `Windows` |
| Recursive | `No` |

## 동작 원칙

- 저장 파일은 설치 폴더가 아니라 사용자 데이터 폴더에 쓴다.
- Steam Auto-Cloud는 앱 시작/종료 시 위 폴더의 JSON 파일을 동기화한다.
- 그래픽 설정, 임시 로그, 기기별 설정은 이 폴더에 넣지 않는다.
- Steamworks 연동 전에도 로컬 서버와 테스트는 같은 경로 규칙을 사용한다.

## 검증

- `tests/SavePaths.test.js`가 기본 Windows 경로, QA override, 랭크 파일 경로, Steam Auto-Cloud 설정값을 검증한다.
