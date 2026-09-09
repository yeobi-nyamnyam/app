# 여비냠냠 (yeobi-nyamnyam)

## 프로젝트 개요

한국관광공사 TourAPI와 행정안전부 착한가격업소 API를 기반으로, 여행 중 실시간
소비 변동을 대화형/전용폼으로 입력하면 남은 식비 예산에 맞춰 주변 음식점을
자동 재추천하는 여행 식비 관리 앱.

## 스택

- 프론트: Expo (React Native) + TypeScript + Expo Router v4
- DB/Auth: Supabase (pg_graphql, RLS)
- GraphQL 클라이언트: Apollo Client
- 타입 생성: graphql-codegen (`pnpm codegen`)
- 스타일링: RN StyleSheet + `packages/tokens` (디자인 토큰, Figma/Tokens Studio 자동 동기화 —
  `docs/design-tokens-pipeline.md` 참고). `packages/ui`가 이를 재-export
- 공통 컴포넌트: `packages/ui`
- 공유 타입: `packages/types`
- 서버: `apps/server` (Express) — 외부 API 프록시 + AI 채팅 처리 (`docs/api-server-boundaries.md` 참고)

> Expo SDK52 기준으로 Expo Router v3는 호환되지 않아 v4(^4.x)를 사용합니다.
> API는 v3와 거의 동일(파일 기반 라우팅, `(group)`, `_layout.tsx` 등)합니다.

## 외부 API

- 구글/카카오 OAuth (소셜 로그인 — 애플 로그인은 스코프 제외)
- 한국관광공사 TourAPI, 행정안전부 착한가격업소 API — **서버 경유**
- 네이버 클로바 리시트 OCR — **서버 경유**
- 네이버 지도 API — 지도 렌더링·매장 검색은 클라이언트 SDK, Geocoding은 서버 경유
- AI 채팅용 LLM — **서버 경유**, provider는 세션 1에서 확정

## 절대 하면 안 되는 것

- NativeWind 또는 className 사용 금지
- any 타입 사용 금지
- StyleSheet 없이 인라인 스타일 숫자/색 하드코딩 금지 (반드시 tokens 참조)
- console.log 커밋 금지
- `supabase/migrations` 파일 혼자 수정 금지 (PR 필수, 팀 공유 먼저)
- `packages/types`, `packages/ui`, `packages/tokens` 혼자 수정 금지 (PR + 리뷰 필수)
- `packages/tokens/src/tokens.ts` 직접 수정 금지 — auto-generated 파일.
  `packages/tokens/tokens.json`(Figma/Tokens Studio 동기화 대상)을 고칠 것
  (`docs/design-tokens-pipeline.md` 참고)
- 외부 API 키(TourAPI, 착한가격업소, 클로바 OCR, AI 채팅, 네이버 지도 Geocoding)를
  클라이언트 코드에 직접 넣기 금지 — 반드시 `apps/server` 경유
- `.env` 커밋 금지
- Claude / Claude Code는 PR을 스스로 머지하지 않음 — 항상 사람 승인 후 머지
- `main`, `develop` 브랜치에 직접 push 금지
- CI(lint + type-check + test) 실패 상태로 PR 생성 금지

## 컴포넌트 작성 규칙

- `StyleSheet.create()` 사용
- 색상, 폰트, 간격은 `@repo/tokens`(또는 이를 재-export하는 `@repo/ui`)에서 import
- variant는 객체 map으로 선언 (if/else 분기 금지)
- 공통 컴포넌트 만들 때 반드시 Storybook story 같이 작성
- `packages/ui/src/components/`에 컴포넌트를 추가할 때는 파일을 바로 두지 않고,
  컴포넌트명과 동일한 폴더로 감싼다. 폴더 안에는 컴포넌트 파일, story 파일,
  그리고 barrel `index.ts`(`export { X } from './X'` 형태)를 둔다.

  ```
  components/
    Button/
      Button.tsx
      Button.stories.tsx
      index.ts
  ```

  다른 곳에서는 `./components/Button`처럼 폴더명까지만 import한다
  (`./components/Button/Button`처럼 파일명까지 쓰지 않음).
- 새 컴포넌트를 만들면 `packages/ui/src/index.ts`(패키지 공개 API 진입점)에도
  반드시 export를 추가한다. 폴더 안 `index.ts`만 만들고 여기 빠뜨리면 다른 앱에서
  `@repo/ui`로 import할 수 없다.
- Props 인터페이스 바로 위에 JSDoc으로 각 prop을 설명한다. `@param prop명 설명`
  형식으로, 가능한 값(union이면 전부 나열)과 optional 여부·기본값을 함께 적는다.

  ```ts
  /**
   * @param label 버튼에 표시할 텍스트
   * @param variant 버튼의 종류: 'primary' | 'outline' (optional, 기본값 'primary')
   * @param disabled 버튼이 비활성화 상태인지: true | false (optional, 기본값 false)
   * @param onPress 버튼을 클릭할 때 발생하는 event 명시 (optional)
   */
  export interface ButtonProps {
    label: string
    variant?: ButtonVariant
    disabled?: boolean
    onPress?: () => void
  }
  ```

## GraphQL 작업 순서

1. `apps/mobile/src/graphql/[기능명]/`에 `.graphql` 파일 작성
2. `pnpm codegen` 실행
3. 생성된 타입 import해서 사용

## 기능 대분류 ↔︎ 폴더명 매핑

기능명세서(v4) 대분류 기준. 화면/쿼리/컴포넌트 폴더명은 아래를 따름.

| 기능명세서 대분류 | 폴더명(`기능명`) |
| --- | --- |
| 회원 인증 (F0) | `auth` |
| 여행 생성 (F1) | `trip-create` |
| 예산 산정 (F2) | `budget` |
| 예산 수정 (F4) | `budget-edit` |
| 음식점 추천 (F3) | `recommend` |
| 채팅 (C) | `chat` |
| 기록 (F6) | `record` |
| 일기 (D) | `diary` |
| 여행 완료 (F7) | `trip-complete` |
| 게이미피케이션-배지 (G) | `badges` |
| 캐릭터 성장 (L) | `character` |
| 마이페이지 (M) | `mypage` |

## 코드 품질 도구

- ESLint: 루트 `.eslintrc.js` (any 금지, className 금지, console.log 금지 등을 규칙으로 강제)
- Prettier: 루트 `.prettierrc` (`singleQuote: true`, `semi: false`, `printWidth: 100`)
- `pnpm lint`, `pnpm type-check`를 PR 전 로컬에서 통과시킬 것

## 개발 플로우

1. Claude가 이슈 템플릿(`.github/ISSUE_TEMPLATE/feature.md`) 기준으로 이슈 생성
   - 제목: `[기능ID] 기능명` (예: `[F6-10] 방문 매장명 검색·자동완성`)
2. 해당 이슈에 맞는 기능별 개발 진행 (`feature/GitHub핸들명-기능ID` 브랜치)
3. 커밋
4. PR 템플릿(`.github/PULL_REQUEST_TEMPLATE.md`) 기준으로 자동 PR 생성
   - base 브랜치: `develop` (feature 브랜치 → `develop`)
   - 이슈 하나당 PR 하나 원칙
   - **assignee**: PR을 만든 사람(작업자) 본인
   - **reviewers**: GitHub 저장소 협업자(collaborators) 중 PR 작성자를 제외한
     나머지 전원 (`gh api repos/:owner/:repo/collaborators`로 조회해서 지정)
   - **milestone**: 별다른 지시가 없으면 `🚂 개발`
   - **labels**: 연결된 이슈에 달린 라벨과 동일하게
5. 사람이 PR 리뷰
6. 사람이 머지 (Claude는 머지하지 않음)

## 브랜치 규칙

- `main`: 배포용
- `develop`: 통합 브랜치 — **PR base 브랜치**
- `feature/GitHub핸들명-기능ID`: 개인 작업 브랜치 (예: `feature/choyeon2e-F6-10`)
  - 한글 이름이 아니라 GitHub 핸들명을 쓴다: 초연 → `choyeon2e`, 수진 → `lemoncurdyogurt`,
    희정 → `DandelionQZ`

PR은 항상 `feature/GitHub핸들명-기능ID` → `develop`으로 올립니다. `develop` → `main`은
배포 시점에 별도로 머지합니다.

## 참고 문서

- `docs/schema-design.md` — DB 스키마 설계 근거
- `docs/erd.mermaid` — ERD (물리/상세, Mermaid)
- `docs/erd-conceptual.mermaid` — ERD (개념적/단순화, 비개발 커뮤니케이션용)
- `docs/server-api-spec.md` — apps/server REST API 명세
- `docs/business-logic-notes.md` — 캐스케이드/재분배/배지판정 등 핵심 로직 규칙
- `docs/api-server-boundaries.md` — 외부 API 서버/클라이언트 경계
- `docs/team-assignment.md` — 담당자 배정표
- `docs/design-tokens-pipeline.md` — Figma → PR → `packages/tokens` 자동 동기화 파이프라인
- `docs/tokens-studio-setup.md` — Tokens Studio 플러그인 GitHub 연동 설정 (디자이너용)
