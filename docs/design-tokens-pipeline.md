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

- `packages/tokens/tokens.json` — Tokens Studio의 "Single file" 동기화 결과물.
  **이 파일이 실제 소스입니다.** Figma Variables(색상/spacing/radius/stroke/icon)와
  Text Styles(타이포그래피)를 각각 `Import variables`/`Import styles`로 가져온
  세트가 그대로 커밋됩니다. Tokens Studio는 엄밀한 W3C DTCG를 따르지 않고 자체
  `$type`(`fontWeights`, `number`, `letterSpacing` 등)과 `{Group.Path}` 형태의
  alias 참조를 씁니다.
- `packages/tokens/scripts/build-tokens.ts` — `tokens.json`에서 필요한 4개
  세트만 읽어 `src/tokens.ts`를 생성:
  - `Color Semantic/Light` (alias는 `Color Primitive/Light`로 해석) → `colors`
  - `Text styles` (Figma Text Style 합성 토큰, alias는 세트 내부에서 해석) → `typography`
  - `Size/Default`의 `Spacing`/`Radius`/`Stroke`/`Icon` 하위 그룹 →
    `spacing`/`radius`/`stroke`/`icon`
  - 그 외 세트(`Font/Default`, `Text Leading/Default`, `Dynamic Type/Small` 등)는
    alias 해석에 필요하지 않아 무시됨
  - Figma 쪽 라벨(`Border 05`, `Radius 4-6`, `XLarge` 등)을 기존 컴포넌트 코드가
    쓰는 키 이름(`stroke.hairline`, `radius['4.6']`, `icon.xlarge`)으로 매핑 —
    이 매핑 덕분에 Figma 네이밍이 바뀌어도 `packages/ui`의 컴포넌트 코드는
    그대로 유지됨. 매핑에 없는 새 키가 나타나면 스크립트가 즉시 에러로 실패함
    (`STROKE_KEY_MAP`, `FONT_WEIGHT_NUMERIC` 등)
- `packages/tokens/src/tokens.ts` — **auto-generated, 직접 수정 금지**. 상단에
  주석으로 명시되어 있음. 로컬에서 다시 만들려면
  `pnpm --filter @repo/tokens build:tokens`

## Tokens Studio 연동 (디자이너)

Figma 플러그인 설치부터 GitHub 연동 설정까지는 `docs/tokens-studio-setup.md`
참고.

## 사람이 항상 하는 일

- Tokens Studio가 만든 원본 PR(`tokens.json`) 리뷰 & 머지
- 자동화가 만든 생성물 PR(`src/tokens.ts`) 리뷰 & 머지
- Claude/Claude Code, 봇 모두 PR을 스스로 머지하지 않음 — 항상 사람 승인 후 머지
  (CLAUDE.md 공통 규칙)
