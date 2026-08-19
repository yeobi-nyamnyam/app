# apps/server REST API 명세

이 문서는 스펙 원본이 아닙니다. 실제 스펙은 라우트에 등록된 zod 스키마로부터
자동 생성됩니다 (drift 방지).

## 문서 보는 법

- Swagger UI: `pnpm --filter server dev` 실행 후 http://localhost:4000/docs
- OpenAPI JSON: http://localhost:4000/openapi.json

## 새 라우트를 추가할 때

1. `apps/server/src/routes/<기능명>.ts` 생성 (기능명 폴더명 매핑은 루트 `CLAUDE.md` 참고)
2. zod로 요청/응답 스키마 정의
3. `registry.registerPath({ method, path, tags, summary, request, responses })`로
   `apps/server/src/openapi/registry.ts`의 registry에 등록
4. Express 핸들러는 같은 스키마로 응답 구성 (`z.infer<typeof Schema>`로 타입 고정,
   런타임 검증이 필요하면 `Schema.parse(...)`)
5. `apps/server/src/index.ts`에 라우터 마운트

`apps/server/src/routes/health.ts`가 최소 예시입니다.

## 컨벤션

- 요청 바디 검증은 zod로, 응답도 같은 zod 스키마 기준으로 구성 (스키마 = 검증 = 문서
  단일 소스)
- 외부 API(TourAPI, 착한가격업소, 클로바 OCR, AI 채팅, 네이버 지도 Geocoding) 프록시
  라우트는 API 키를 서버 환경변수에서만 읽고 응답에 원본 키/토큰을 그대로 흘려보내지
  않기
- 모바일에서도 같은 타입이 필요하면 `z.infer`로 뽑은 타입을 `packages/types`에서
  재노출해서 서버/모바일이 같은 타입을 import (수동 중복 정의 금지)
