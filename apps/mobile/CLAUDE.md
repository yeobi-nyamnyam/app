# apps/mobile

Expo Router v4 클라이언트. 프로젝트 전체 규칙(스택, 금지사항, 브랜치/PR 플로우)은
루트 `CLAUDE.md`를 따르고, 이 문서는 apps/mobile 안에서의 폴더 구조와 규칙만 다룹니다.

## 폴더 구조

```
src/
  app/               # Expo Router v4 파일 기반 라우팅
    (auth)/          # 인증 전 화면 (로그인 등)
    (main)/          # 인증 후 메인 화면
    _layout.tsx      # 루트 레이아웃 (ApolloProvider, SafeAreaProvider, Stack)
  components/        # 이 앱 전용 컴포넌트 (2개 화면 이상/다른 앱에서도 쓰면 packages/ui로 승격)
  graphql/
    <기능명>/         # 아래 매핑표 기준 폴더명, .graphql 쿼리/뮤테이션 정의
  hooks/
  lib/
    supabase.ts      # Supabase 클라이언트
    apollo.ts        # Apollo Client (apps/server GraphQL 엔드포인트 호출)
```

## graphql/ 하위 폴더 규칙

루트 `CLAUDE.md`의 "기능 대분류 ↔︎ 폴더명 매핑" 표를 그대로 따릅니다.
새 기능을 추가할 때 표에 없는 폴더명을 임의로 새로 만들지 말고, 아래 중 하나에 넣습니다.
표에 없는 기능이 새로 생기면 폴더를 만들기 전에 루트 `CLAUDE.md`의 표부터 갱신하세요 (PR 리뷰 대상).

| 기능명세서 대분류 | 폴더명(`src/graphql/기능명`) |
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

각 `graphql/<기능명>/` 폴더 안 파일 규칙:

- `*.graphql` — 쿼리/뮤테이션/구독 원본. 실제로 손으로 작성하는 파일
- `*.generated.ts` — `pnpm codegen` 산출물. **직접 수정 금지**, `.graphql` 파일을 고쳐서 다시 생성
- 파일명은 `동작-대상.query.graphql` / `동작-대상.mutation.graphql` 형태 권장
  (예: `trip-create/create-trip.mutation.graphql`, `budget/meal-slots.query.graphql`)
- 한 폴더 안에는 해당 기능명 화면/훅에서만 쓰는 쿼리만 둡니다. 여러 기능에서 공유되는
  쿼리(예: 유저 프로필 조회)는 가장 주된 소유 기능(`auth` 또는 `mypage`)에 두고 재사용

## GraphQL 작업 순서 (루트 CLAUDE.md 동일)

1. `src/graphql/<기능명>/`에 `.graphql` 파일 작성
2. 루트에서 `pnpm codegen` 실행
3. 생성된 타입/훅을 import해서 화면·훅에서 사용 (직접 `gql` 태그로 재정의 금지)

## 라우팅 (Expo Router v4)

- `(auth)`, `(main)`은 URL 세그먼트에 노출되지 않는 라우트 그룹입니다
- 그룹별 인증 가드가 필요하면 각 그룹 안에 자체 `_layout.tsx`를 추가해서 처리하고,
  루트 `_layout.tsx`에는 전역 Provider 조합 외의 분기 로직을 넣지 않습니다
- 화면 파일과 그 화면이 쓰는 GraphQL 쿼리의 기능명(`graphql/<기능명>/`)은 최대한 일치시킵니다

## 컴포넌트 작성 규칙

- `StyleSheet.create()` 사용, NativeWind/className 금지 (루트 CLAUDE.md 금지사항)
- 색상·폰트·간격은 `packages/ui/src/tokens.ts`에서 import — 숫자/색 하드코딩 금지
- variant는 객체 map으로 선언 (if/else 분기 금지)
- `src/components/`는 이 앱 전용. 다른 화면/다른 앱에서도 재사용될 컴포넌트는
  `packages/ui`로 옮기고 Storybook story를 같이 작성

## lib/

- `supabase.ts` — Auth(세션) 및 최소한의 직접 DB 접근용. 데이터 조회/변경은 대부분
  GraphQL(Apollo) 경유가 원칙이며, `supabase-js`로 테이블을 직접 쿼리하는 코드를
  추가하기 전에 GraphQL 경로로 대체 가능한지 먼저 확인
- `apollo.ts` — Supabase 세션의 access token을 Authorization 헤더에 실어
  `apps/server`의 GraphQL 엔드포인트를 호출

## mobile 특화 금지사항 (루트 CLAUDE.md 전체 목록도 동일 적용)

- `app.config.ts`의 `extra`에는 클라이언트에 노출돼도 되는 값만 (Supabase anon key,
  Google/Kakao client id, 네이버 지도 client id). TourAPI·착한가격업소·클로바 OCR·
  AI 채팅·네이버 지도 Geocoding 키는 서버 전용이므로 여기 넣지 않음
- `any` 타입 금지 — GraphQL 응답은 codegen 타입 사용, 그 외는 명시적 타입 또는
  `unknown` + 타입가드
- `console.log` 커밋 금지
