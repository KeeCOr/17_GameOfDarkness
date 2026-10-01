# 광고/광고 제거 상품 구현 계획

작성일: 2026-06-01
대상: ChessSummon 출시/수익화 설계

## 1. 결론

Steam 출시를 목표로 한다면 매칭 중 광고, 승패 후 확률 광고, 광고 제거 상품은 그대로 구현하지 않는 것이 좋다. Steam 공식 문서는 Steam 배포 게임에서 광고 기반 비즈니스 모델을 지원하지 않으며, 플레이를 위해 광고 시청이나 광고 참여를 요구하거나 광고 시청으로 플레이어에게 가치를 제공하는 방식을 허용하지 않는다고 안내한다.

따라서 수익화는 플랫폼별로 분리한다.

- Steam 버전: 광고 없음. 유료 판매, DLC, Steam Microtransaction 기반 선택 상품으로 설계한다.
- 비Steam 모바일/웹 버전: 광고 SDK, 광고 제거 상품, 승패 후 확률 광고를 별도 빌드 플래그로 관리한다.

## 2. 플랫폼별 정책 방향

### Steam 버전

허용 방향:

- 유료 게임
- 무료 게임 + Steam Wallet 기반 인게임 구매
- DLC
- 꾸미기 상품, 후원 팩, 사운드트랙, 확장 콘텐츠

피해야 할 방향:

- 매칭 중 배너 광고
- 경기 종료 후 강제/확률 광고
- 광고를 봐야 보상을 얻는 구조
- 광고 제거 상품
- 외부 결제 수단

### 모바일/웹 버전

가능 방향:

- 매칭 대기 중 하단 배너 광고
- 경기 종료 후 확률형 전면 광고
- 보상형 광고
- 광고 제거 영구 상품

주의:

- 플랫폼별 정책, 개인정보 동의, 연령 등급, 광고 추적 동의가 필요하다.
- Steam 빌드와 코드 경로가 섞이면 검수 리스크가 생긴다.

## 3. 권장 수익화 구조

### Steam용 대체안

Steam에서는 광고 제거 상품 대신 다음 상품이 더 적합하다.

1. Supporter Pack
   - 전용 보드 스킨
   - 전용 말 테두리
   - 프로필 배지
   - 개발자 후원 표기

2. Cosmetic Pack
   - 말 스킨
   - 전투 이펙트 색상
   - 승급/처치 연출 스킨

3. Expansion DLC
   - 신규 보드 규칙
   - 챌린지 모드
   - 추가 AI 성격

4. Paid Base Game
   - 광고 없이 일회성 구매
   - 출시 초기에는 가장 단순하고 안전하다.

추천: 1차 Steam 출시는 광고 없는 유료 게임 또는 무료+Supporter Pack으로 간다.

## 4. 비Steam 광고 기능 설계

비Steam 빌드에서만 광고를 켠다면 다음 구조가 좋다.

### 광고 노출 지점

1. 매칭 대기 중 하단 배너
   - 위치: 9:16 레이아웃 최하단 또는 매칭 화면 하단 고정 영역
   - 조건: 매칭 대기 시작 후 2초 뒤 표시
   - 제거 조건: 매칭 성공, AI 대체 매칭 시작, 뒤로가기
   - 광고 제거 구매자에게는 표시하지 않음

2. 경기 종료 후 확률형 전면 광고
   - 패배: 35% 확률
   - 승리: 15% 확률
   - 튜토리얼 완료 직후: 표시하지 않음
   - 첫 3판: 표시하지 않음
   - 광고 제거 구매자에게는 표시하지 않음
   - 같은 세션에서 최소 3분 쿨다운

3. 광고 실패 처리
   - 광고 로드 실패 시 결과 화면으로 즉시 이동
   - 광고 닫기 실패 시 게임 진행을 막지 않음
   - 광고 SDK 오류는 로깅만 하고 플레이를 유지

## 5. 시스템 설계

### 빌드 플래그

```text
MONETIZATION_PLATFORM=steam | mobile | web
ADS_ENABLED=true | false
```

Steam 빌드:

```text
MONETIZATION_PLATFORM=steam
ADS_ENABLED=false
```

비Steam 광고 빌드:

```text
MONETIZATION_PLATFORM=mobile
ADS_ENABLED=true
```

### 모듈 구조

```text
src/monetization/
  MonetizationConfig.js
  EntitlementStore.js
  AdService.js
  SteamPurchaseService.js
  MockAdService.js
```

역할:

- `MonetizationConfig`: 플랫폼과 광고 활성 여부 결정
- `EntitlementStore`: 광고 제거 구매 여부 저장/조회
- `AdService`: 배너, 전면 광고 표시/숨김 API
- `SteamPurchaseService`: Steam Wallet 기반 구매 처리
- `MockAdService`: 테스트/개발용 가짜 광고 서비스

### 게임 씬 연결

매칭 로비:

```text
빠른 매칭 클릭
-> AdService.showBanner('matchmaking-bottom')
-> 사람 매칭 성공 또는 AI 대체 매칭 시작
-> AdService.hideBanner()
```

결과 화면:

```text
경기 종료
-> AdPolicy.shouldShowResultAd(result, playerHistory)
-> true면 AdService.showInterstitial()
-> 광고 종료/실패 후 결과 화면 표시
```

광고 제거 상품:

```text
상점 버튼 클릭
-> 플랫폼별 구매 API 실행
-> 구매 성공
-> EntitlementStore.setNoAds(true)
-> 모든 광고 요청 무시
```

## 6. UX 원칙

- 광고 때문에 매칭/결과/재시작 흐름이 멈추면 안 된다.
- 승리 직후 광고 확률은 낮게 둔다. 승리 감정을 끊으면 리뷰가 나빠질 수 있다.
- 패배 광고도 연속 노출되면 이탈이 커지므로 쿨다운을 둔다.
- 광고 제거 상품은 숨기지 말고 설정/상점에서 명확히 보여준다.
- Steam 버전에는 광고 관련 UI 자체를 노출하지 않는다.

## 7. 테스트 계획

### 단위 테스트

- Steam 빌드에서는 `ADS_ENABLED=false`
- 광고 제거 구매자는 배너/전면 광고를 보지 않음
- 첫 3판에는 결과 광고가 나오지 않음
- 승리/패배별 광고 확률 계산이 설정값을 따른다
- 광고 실패 시 결과 화면으로 진행된다

### 통합 테스트

- 매칭 시작 시 배너 표시
- 사람 매칭 성공 시 배너 제거
- AI 대체 매칭 시작 시 배너 제거
- 결과 광고 종료 후 결과 화면 표시
- 광고 제거 구매 후 광고 요청 무시

### 플랫폼 검증

- Steam 빌드에 광고 SDK가 포함되지 않는지 확인
- Steam 빌드에 광고 제거 상품 문구가 노출되지 않는지 확인
- 비Steam 빌드에서만 광고 UI가 표시되는지 확인

## 8. 구현 순서

1. 정책 결정
   - Steam에는 광고를 넣지 않는 것으로 확정
   - 광고 기능은 비Steam 빌드 전용으로 분리

2. 수익화 설정 계층 추가
   - `MonetizationConfig`
   - 빌드 플래그
   - 광고 활성 조건

3. 권한 저장소 추가
   - 광고 제거 여부 저장
   - 개발용 로컬 저장
   - Steam용 구매 권한 확인 자리 만들기

4. 광고 서비스 추상화
   - 실제 SDK 없이 인터페이스와 Mock부터 구현
   - 매칭/결과 화면에서 서비스만 호출

5. 매칭 로비 연결
   - 매칭 대기 중 배너 요청
   - 매칭 성공/취소/AI 대체 시 배너 제거

6. 결과 화면 연결
   - 승패별 확률 정책
   - 쿨다운
   - 첫 플레이 보호

7. 광고 제거 상품 UI
   - 비Steam 빌드에서만 표시
   - 구매 성공 후 즉시 광고 제거

8. Steam 빌드 차단 검증
   - 광고 코드 경로 비활성
   - 광고 UI 미노출
   - 문서/상점 설명에서 광고 제거

## 9. Steam 출시용 권장 결정

ChessSummon의 Steam 버전은 광고를 넣지 않는다. 대신 다음 중 하나로 간다.

- 유료 게임: 가장 안전하고 명확하다.
- 무료 게임 + Supporter Pack: 진입 장벽은 낮고 정책 리스크도 낮다.
- 무료 게임 + 꾸미기 Microtransaction: 장기 운영형으로 확장 가능하지만 백엔드와 구매 검증이 필요하다.

현재 개발 단계에서는 유료 게임 또는 무료+Supporter Pack이 가장 현실적이다.

## 10. 참고 문서

- Steam Advertising on Steam: https://partner.steamgames.com/doc/marketing/advertising
- Steam Microtransactions: https://partner.steamgames.com/doc/features/microtransactions
- Steam Free To Play Games: https://partner.steamgames.com/doc/store/freetoplay
