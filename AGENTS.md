# ChessSummon 작업 규칙

## 빌드 및 실행파일 배치

지시사항 수행 완료 후 반드시 아래 순서로 실행한다.

### 빌드 명령어

```bash
cd C:/Development/17_DC && npm run dist
```

`npm run dist` = `vite build && electron-builder --win --x64` (한 번에 처리)

### 실행파일 배치
- 빌드 출력: `C:/Development/17_DC/release/ChessSummon_v{버전}_portable.exe`
- 루트에도 동일하게 배치: `C:/Development/17_DC/ChessSummon_v{버전}_portable.exe`
- 이전 버전 루트 파일은 삭제

### 버전 관리
- `C:/Development/17_DC/package.json`의 `version` 패치 버전 증가 후 빌드

## 기획서 최신화

기능 추가/변경 후 반드시 업데이트:
- `docs/ChessSummon_기획서.md`
- `docs/ChessSummon_기획서.html`


# 워크플로우 기록 — 2026-10-14 상시 승인

## 승인된 개발 절차

1. **테스트/빌드 확인** — 승인된 개발 범위 안에서 로컬 테스트·빌드 통과 확인
2. **GDD 갱신** — 현재 구현 상태에 맞게 GDD MD/HTML 보충 섹션 업데이트
3. **수정 이력 기록** — 변경 이유·수정 내용·검증 범위·미검증 범위·예정 커밋 내용을 수정 이력에 기록
4. **Git diff·비밀값 점검** — 커밋 전 diff 검토 및 비밀값 노출 여부 확인
5. **GitHub 반영 및 원격 SHA 확인** — 푸시 후 원격 커밋 SHA 기록

## 운영 원칙

- 기존 미확인 변경은 현재 작업에 섞지 않으며, 필요 시 별도 검토 브랜치 사용
- GitHub 반영(push)은 현재 개발 완료 절차로 승인됨
- 배포·병합·유료 생성은 별도 승인 필요
- GDD는 기존 Claude 작성 정책 유지 (전체 재작성 아닌 보충 섹션 추가)
