<!--
PR 제목 형식: [기능ID] 기능명 (예: [F6-10] 방문 매장명 검색·자동완성)
이슈 하나당 PR 하나가 원칙입니다. 여러 기능ID를 하나의 PR로 묶지 마세요.
-->

## 관련 이슈

Closes #<!-- 이슈 번호 -->

## 변경 요약

<!-- 무엇을, 왜 바꿨는지 3~5줄 이내로 -->

## 변경 범위

- [ ] `apps/mobile`
- [ ] `apps/server`
- [ ] `packages/ui`
- [ ] `packages/types`
- [ ] `supabase/migrations`
- [ ] `docs`

## 테스트 방법

<!-- 재현/확인 절차, 필요 시 스크린샷 또는 화면 녹화 첨부 -->

## 체크리스트

- [ ] `pnpm lint` 통과
- [ ] `pnpm type-check` 통과
- [ ] `any` 타입 미사용 확인
- [ ] `className` / NativeWind 미사용, `StyleSheet` + `tokens.ts` 사용 확인
- [ ] `console.log` 미포함
- [ ] 외부 API 키가 클라이언트 코드에 직접 노출되지 않음 (`apps/server` 경유 확인)
- [ ] 신규 공통 컴포넌트가 있다면 Storybook story 포함
- [ ] `supabase/migrations` 변경 시 팀에 사전 공유함
- [ ] `packages/types`, `packages/ui` 변경 시 리뷰어 지정함

## 리뷰어에게

<!-- 특별히 봐줬으면 하는 부분, 애매한 판단이 있었던 부분 등 -->

---
> ⚠️ 이 PR은 사람 리뷰 후 사람이 직접 머지합니다. Claude/Claude Code는 이 PR을 스스로 머지하지 않습니다.
