---
name: 기능 개발
about: 기능명세서(v4)의 기능 ID 기준으로 개발 이슈를 생성합니다
title: "[기능ID] 기능명"
labels: ""
assignees: ""
---

<!--
제목 형식: [F6-10] 방문 매장명 검색·자동완성
기능명세서(docs/schema-design.md, 기능명세서 v4 시트)의 기능 ID를 그대로 사용하세요.
-->

## 기능 정보

- **기능 ID**: <!-- 예: F6-10 -->
- **대분류 / 폴더명**: <!-- 예: 기록 (record) — CLAUDE.md 폴더명 매핑표 참고 -->
- **우선순위**: <!-- 필수 / 핵심 / 선택 -->
- **담당자**: <!-- docs/team-assignment.md 참고 -->

## 상세 설명

<!-- 기능명세서 D열(상세 설명) 내용을 그대로 붙여넣거나, 논의된 변경 사항을 반영해 작성 -->

## 사용 API / 데이터

<!-- 예: 네이버 지도 API (서버 경유 여부 명시) -->

## 관련 문서

- [ ] `docs/schema-design.md` / `docs/erd.mermaid` — 관련 테이블 확인
- [ ] `docs/business-logic-notes.md` — 캐스케이드/재분배/배지판정 등 로직 규칙 확인
- [ ] `docs/api-server-boundaries.md` — 외부 API 서버 경유 대상인지 확인
- [ ] `docs/server-api-spec.md` — 서버 REST API 스펙 필요 시 확인/추가

## 완료 조건 (Definition of Done)

- [ ] 화면/로직 구현 (해당 시 GraphQL 쿼리 작성 → `pnpm codegen` → 타입 반영)
- [ ] 공통 컴포넌트 신규 작성 시 Storybook story 포함
- [ ] 핵심 로직(계산/분기가 있는 순수 함수 등) 추가·수정 시 테스트 작성함
- [ ] `pnpm lint`, `pnpm type-check`, `pnpm test` 통과
- [ ] 외부 API 키를 클라이언트에 직접 넣지 않았는지 확인 (`apps/server` 경유)
- [ ] 관련 마이그레이션 필요 시 팀에 공유 후 `supabase/migrations/`에 추가

## 의존성 / 선행 이슈

<!-- 이 기능이 의존하는 다른 기능ID가 있다면 명시. 예: F3-5(배치 캐싱) 선행 필요 -->
