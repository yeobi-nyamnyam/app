# 디자인 토큰 자동 동기화 파이프라인

`packages/tokens`는 Figma에서 정의한 디자인 토큰(색상/타이포그래피/spacing/radius/
stroke/icon)의 단일 소스입니다. `packages/ui`는 npm publish 없이 이 패키지를
워크스페이스 의존성으로 참조해 재-export합니다 (`packages/ui`는 RN 컴포넌트를
포함하므로 범용 번들링 대상이 아님).

## 전체 흐름

```
디자이너: Figma에서 토큰 수정
  → Tokens Studio가 packages/tokens/tokens.json(DTCG 포맷) 변경 PR을 자동 생성
     (base: develop)
  → 개발자: PR 리뷰 & Approve & Merge (develop에 직접 push 금지 — 항상 PR)
  → GitHub Actions(.github/workflows/tokens-sync.yml)가 develop push를 감지
  → ① tokens.json 파싱 + 카테고리별 단위 변환
     (scripts/build-tokens.ts 실행 → src/tokens.ts 생성)
  → ② lint + type-check 통과 확인
  → ③ 변경분이 있으면 자동으로 후속 PR 생성 (branch: bot/tokens-sync, base: develop)
  → 개발자: 생성된 diff 리뷰 & 머지
```

npm publish 단계는 없습니다. `packages/tokens`는 private workspace 패키지로,
빌드 없이 TS 소스를 그대로 참조합니다(`packages/ui`, `apps/mobile`과 동일 패턴).

## 파일 구성

- `packages/tokens/tokens.json` — Figma/Tokens Studio가 쓰는 DTCG 포맷 원본.
  **이 파일이 실제 소스입니다.**
- `packages/tokens/scripts/build-tokens.ts` — `tokens.json`을 파싱해
  `src/tokens.ts`를 생성. 카테고리별 변환 규칙:
  - `color`: 그대로 통과 (hex 문자열)
  - `dimension`(spacing/radius/stroke/icon): `"8px"` → `8` (숫자, RN 단위 없는 dp)
  - `typography`: `fontSize`/`letterSpacing`은 px 문자열 → 숫자, `lineHeight`는
    px 문자열 또는 `fontSize` 대비 `%` 문자열 모두 지원해 px 숫자로 정규화
- `packages/tokens/src/tokens.ts` — **auto-generated, 직접 수정 금지**. 상단에
  주석으로 명시되어 있음. 로컬에서 다시 만들려면
  `pnpm --filter @repo/tokens build:tokens`

## 사람이 항상 하는 일

- Tokens Studio가 만든 원본 PR(`tokens.json`) 리뷰 & 머지
- 자동화가 만든 생성물 PR(`src/tokens.ts`) 리뷰 & 머지
- Claude/Claude Code, 봇 모두 PR을 스스로 머지하지 않음 — 항상 사람 승인 후 머지
  (CLAUDE.md 공통 규칙)
