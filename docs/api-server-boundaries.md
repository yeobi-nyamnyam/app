# API 경계 & apps/server 역할 정리

세팅 가이드 STEP1의 `apps/server`는 빈 폴더로만 생성되어 있고 역할이 정의되어
있지 않습니다. 여비냠냠은 외부 API 키가 많고 그중 다수가 유료/쿼터 제한이 있는
API라, **키 노출 방지 + 요청 제어**를 위해 서버 경유가 필요한 것과 클라이언트
직접 호출이 가능한 것을 나눠야 합니다. 세션 1에서 최종 합의 필요, 아래는 제안안입니다.

## 서버(apps/server) 경유 권장

| API | 이유 |
|---|---|
| TourAPI (한국관광공사) | 쿼터 제한 있음, `restaurants` 캐시 24시간 배치 수집에 사용 (F3, F3-1 런타임엔 라이브 호출 없음, `docs/business-logic-notes.md` §8 참고) |
| 행안부 착한가격업소 API | 위와 동일. 위치 검색 파라미터가 없어 전량 페이지네이션 수집 후 `restaurants`에 캐싱 |
| 네이버 지도 Geocoding API | `restaurants` 배치에서 착한가격업소의 누락된 좌표를 주소 기반으로 보강할 때 사용. 지도 SDK 렌더링(클라이언트)과는 별개로 이 호출은 서버 배치 전용 |
| 네이버 클로바 리시트 OCR | API 키 유료, 이미지 업로드 처리 필요 (Storage 업로드 → 서버 → OCR 호출) |
| 네이버 지도 검색 API (매장명 자동완성, **F6-10**) | 사용자가 타이핑할 때마다 호출되는 실시간 검색이라 요청량이 많음 — 키 노출 방지 + 쿼터 관리 위해 서버 경유 권장. 서버가 후보 목록(이름/주소/좌표)을 그대로 릴레이, 선택 결과의 좌표는 `meal_logs.store_latitude/longitude`에 채움 (`docs/schema-design.md` §4 참고) |
| AI 채팅 (C1, C2) | LLM API 키 보호 필수. 서버는 Gemini 호출 + SSE 릴레이만 담당하는 무상태 프록시이고, 파싱 결과(C2)는 서버가 zod로 검증해 반환하되 `chat_messages`/`meal_logs` 기록은 클라이언트가 GraphQL로 처리 (아래 매핑 참고) |

## 클라이언트 직접 호출 가능

| API | 이유 |
|---|---|
| Supabase (Auth/GraphQL) | anon key는 RLS로 보호되므로 클라이언트 직접 호출 정상 |
| 네이버 지도 API (지도 렌더링용 SDK) | 지도 표시 자체는 클라이언트 SDK가 표준 사용법. Geocoding(배치용)과 매장 검색(F6-10)은 서버 경유(위 참고), 클라이언트는 렌더링만 |
| 구글/카카오 OAuth | Supabase Auth가 표준 흐름으로 처리 |

## 결정이 필요한 것

- [x] **`region_cache` 성격** — TourAPI 호출로 채우는 캐시가 아니라 **팀이 준비한 정적 데이터셋(엑셀 등)을 배포 시 시드로 삽입**하는 마스터 테이블로 확정. 지원하지 않는 지역이면 API 폴백 없이 "조회할 수 없는 지역입니다" 에러 처리 (`docs/schema-design.md` §11 참고)
- [x] **AI 채팅 호출 방식** — 서버 경유로 결정. 지연시간 체감을 줄이기 위해 서버→클라이언트 구간은 SSE로 LLM 응답을 스트리밍 릴레이
- [x] **AI 채팅 LLM provider** — **Google Gemini(`gemini-2.0-flash`)로 확정**. 카드 등록 없이 쓸 수 있는 무료 티어(분당/일별 요청 한도만 있음)라 팀 예산 부담 없이 바로 시작 가능. `apps/server/.env.example`의 `AI_CHAT_PROVIDER=gemini`, `GEMINI_API_KEY` 반영
- [ ] `apps/server` 프레임워크 — Express 기준으로 세팅 가이드에 명시되어 있음, 유지할지 확인
- [ ] 서버 배포 방식 (개발 중엔 로컬로 충분하지만, 발표/시연 전엔 배포 필요 — 이번 세션 범위는 아님)
- [x] **식당 데이터 캐싱 방식** — 착한가격업소+TourAPI를 `restaurants` 테이블에 24시간 배치로 통합 캐싱 확정. 착한가격업소는 위치검색 파라미터가 없어 전량 수집 + 주소 파싱 + Geocoding 좌표 보강 필요 (`docs/schema-design.md` §12, `docs/business-logic-notes.md` §8 참고)
- [x] **기능명세서 v4(0812) 반영** — F3-5는 위 `restaurants`/배치 설계와 일치 (공식 기능 ID로 인용만 추가). F6-10(매장명 검색·자동완성)은 새 API 경계 항목으로 서버 경유 확정, `meal_logs`에 좌표 컬럼 추가 필요성 발견 (`docs/schema-design.md` §4)
- [ ] **네이버 지도 검색 API 키 체계 확인 필요** — "네이버 지도 검색 API"가 지도 렌더링(Naver Cloud Platform Maps)과 같은 Client ID/Secret을 쓰는지, 별도 발급(Naver Developers 지역 검색 API 등)이 필요한지 확인 후 `.env.example`에 별도 키 추가 여부 결정 필요

## 기능-API 매핑 빠른 참고

- **F1-1 지역 입력** → `region_cache` (정적 시드 데이터에서 조회, 없는 지역이면 API 호출 없이 에러 처리)
- **F3, F3-1, F3-3 추천** → `restaurants` 캐시 테이블만 조회 (라이브 API 호출 없음), 24시간 배치로 사전 캐싱
- **F6-2, F6-3 OCR** → 서버 경유, 실패 시 원본 이미지는 유지하고 필드만 수정 화면으로
- **F6-10 매장명 검색·자동완성** → 서버 경유, 결과 좌표를 `meal_logs.store_latitude/longitude`에 채워 M2(방문 매장 지도) 대응
- **C1, C2 채팅** → 서버는 Gemini 호출 + SSE 스트리밍 릴레이만 담당(무상태, DB 미접근). 클라이언트가 요청 바디에 오늘 예산/소비 컨텍스트를 실어 보내면 서버가 이를 프롬프트에 포함해 호출하고, 검증된 파싱 결과(`reply`/`hasExpense`/`amount`/`category`)만 SSE로 반환. `chat_messages` 기록과 `meal_logs` 확정(비-식비 항목)은 F1/F2/F4/F6와 동일하게 클라이언트가 Supabase GraphQL로 직접 처리
- **G0~G17 배지 판정, L0~L4 포인트** → 여행 완료 처리(F7) 시 서버(또는 Edge Function)가 일괄 계산 권장 (클라이언트가 직접 배지 판정 로직을 갖고 있으면 위변조 위험)
