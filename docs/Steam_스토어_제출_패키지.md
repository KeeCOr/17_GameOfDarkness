# Chess of Dark Steam 스토어 제출 패키지

최종 갱신: 2026-06-12

공식 기준 출처:
- Steamworks Graphical Assets: https://partner.steamgames.com/doc/store/assets
- Steamworks Trailers: https://partner.steamgames.com/doc/store/trailer

Steamworks 문서 기준으로 2024년 8월 이후 대부분의 캡슐은 더 큰 최신 크기를 요구하며, 예전 크기는 더 이상 허용되지 않는다. 이 프로젝트의 코드 기준 카탈로그는 `src/steam/storeAssets.js`에 있다.

## 1. 필수 그래픽 자산

| 자산 | 크기 | 용도 | 제작 방향 |
| --- | ---: | --- | --- |
| Header Capsule | 920 x 430 | 스토어 상단 | 로고 + 어두운 체스 홀 + 금속 프레임 |
| Small Capsule | 462 x 174 | 목록/추천 영역 | 로고 가독성 최우선, 글자 크게 |
| Main Capsule | 1232 x 706 | 주요 노출 | 시작 화면 배경과 로고를 결합 |
| Vertical Capsule | 748 x 896 | 세로형 추천 | 왕 말/체스판/소환 마나를 세로 구도 |
| Screenshots | 최소 1920 x 1080, 16:9 | 스토어 갤러리 | 실제 플레이 UI, 시작 화면, 체크메이트, 소환 장면 |
| Shortcut Icon | 256 x 256 | 바로가기/클라이언트 | 왕관 또는 왕 말 문장 |
| App Icon | 184 x 184 JPG | Steam 앱 아이콘 | 작은 크기에서도 식별되는 문장 |
| Library Capsule | 600 x 900 | 라이브러리 세로 카드 | 시작 화면 톤의 세로 포스터 |
| Library Hero | 3840 x 1240 PNG | 라이브러리 배경 | 텍스트 없이 어두운 체스 홀/보드 분위기 |
| Library Logo | 1280px wide 또는 720px tall PNG | Hero 위 로고 | 투명 배경 `CHESS OF DARK` 로고 |
| Library Header Capsule | 920 x 430 | 라이브러리 헤더 | Header Capsule과 같은 계열 |

선택 자산:
- Page Background: 1438 x 810, 너무 밝지 않은 은은한 배경.

## 2. 스크린샷 샷 리스트

1. 시작 화면: 로고, 싱글/멀티 버튼, 어두운 체스 홀 배경.
2. 난이도 선택: 쉬움/보통/어려움/매우 어려움 버튼과 잠금 문구.
3. 인게임 기본: 5x5 보드, 상단 시간 HUD, 하단 소환 카드.
4. 소환 장면: 마나 게이지와 소환 카드 선택 상태.
5. 체크 연출: 왕 위협 인지와 강한 피드백.
6. 체크메이트/승리 결과 화면.
7. 매우 어려움 해금 또는 어려움 승리 장면.

## 3. 트레일러 구성 초안

길이: 15-30초.

구성:
- 0-3초: 로고와 어두운 체스판 분위기.
- 3-8초: 말을 이동하고 시야가 밝아지는 장면.
- 8-14초: 마나로 새 말을 소환하는 장면.
- 14-20초: 체크/처치/승급/체크메이트 연출.
- 20-30초: “Summon. Read the dark. Break the king.” 같은 짧은 문구와 로고.

## 4. 스토어 문구 초안

짧은 설명:
> Chess of Dark is a 5x5 dark tactical chess game where every move reveals danger and every summon can turn the board.

한국어 짧은 설명:
> Chess of Dark는 제한된 시야 속에서 말을 움직이고 마나로 새 말을 소환해 왕을 무너뜨리는 5x5 전술 체스 게임입니다.

핵심 특징:
- 제한된 시야와 체스식 시간 압박.
- 한 턴에 이동 1회, 소환 1회.
- 마나를 모아 기사, 비숍, 룩, 퀸을 소환.
- 체크, 처치, 승급, 체크메이트 중심의 강한 전투 피드백.
- 쉬움부터 매우 어려움까지 이어지는 싱글 플레이 도전.

## 5. 다음 작업

- 캡슐별 PSD/PNG 원본 제작.
- 16:9 스크린샷용 별도 캔버스 또는 캡처 장면 구성.
- 30초 이하 트레일러 녹화/편집.
- 영어/한국어 스토어 설명 최종 교정.
- Steamworks 앱 페이지에 실제 자산 업로드 후 readiness blocker 갱신.
