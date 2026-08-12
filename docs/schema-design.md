# 여비냠냠 — Supabase 스키마 설계 (v1, 8/12 세션용)

기능명세서 v3(0805) 기준으로 설계. 세팅 가이드 STEP3의
`[여기에 세션1에서 설계한 테이블들 적기]` 부분을 이 문서로 대체해서 진행하면 됩니다.

> 이 문서는 세션 중 화이트보드/논의로 언제든 바뀔 수 있음. 확정되면
> `supabase/migrations/20260812000000_initial_schema.sql` 그대로 적용.

---

## 테이블 목록 & 관계 개요

```
auth.users (Supabase 내장)
  └─ profiles (1:1)        — 닉네임, 고유ID, 탈퇴 상태
  └─ trips (1:N)           — 여행
       ├─ meal_slots (1:N)      — 끼니 슬롯(예산+기록상태)
       │     └─ meal_logs (1:N, nullable FK) — 끼니 소비
       ├─ meal_logs (1:N, meal_slot_id null) — 끼니 외(기타) 소비
       ├─ budget_change_history (1:N)
       ├─ chat_messages (1:N)
       ├─ diaries (1:N)
       └─ user_badges (1:N)
  └─ exp_ledger (1:N)      — 포인트 원장 (trip 참조 가능, nullable)
  └─ user_badges (1:N)     — 배지 획득 이력
badges (마스터 테이블, 시드 데이터)
region_cache (마스터 테이블, 정적 시드 데이터 — 지원 지역 화이트리스트)
restaurants (캐시 테이블, 24시간 배치 — 착한가격업소+TourAPI 통합)
  └─ meal_logs.restaurant_id (nullable FK) — 추천에서 온 기록만 연결
```

---

## 1. `profiles`
Supabase `auth.users`를 확장하는 앱 프로필 (F0-4, F0-3)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK, FK → auth.users(id) | |
| nickname | text | '형용사+동물' 자동생성, 10자 이내, 중복 허용 |
| handle | text UNIQUE | `@jdof-v2` 형식, 수정 불가 |
| status | text CHECK (active/deleted) | 탈퇴 시 'deleted' (F0-3) |
| created_at / updated_at | timestamptz | |

## 2. `trips`
여행 (F1, F2, F4)

> **`status`가 왜 `ongoing`/`completed` 2개뿐인가:** F1-2상 시작일은 항상 미래로만
> 생성되므로 모든 여행은 "시작 전" 상태로 만들어지지만, F2/F2-1/F2-2에 따라 생성
> 시점에 전체 기간의 `meal_slots`가 이미 다 만들어져 있고 F3-3(추천 기준)도
> "가장 이른 미기록 끼니" 기준이라 시작 전/진행 중을 DB가 구분하지 않아도 로직이
> 동일하게 동작합니다. "예정" 표시가 필요하면 `start_date > 오늘`로 클라이언트/쿼리에서
> 계산해서 보여주면 되고, 별도 status로 저장하면 시작일이 되는 순간 `upcoming → ongoing`
> 전환용 배치/트리거가 추가로 필요해져서 불필요한 동기화 지점이 생깁니다.
> 반면 `completed`는 F7-1(완료 후 기록 제한)의 쓰기 권한 게이트 기준이라 반드시
> DB에 사실로 저장해야 합니다.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → auth.users | |
| name | text | |
| region_code | text | 자체 지역코드 캐시 참조, 생성 후 수정 불가 (F1-1) |
| start_date / end_date | date | 시각 미포함, 생성 후 수정 불가 (F1-2) |
| total_budget | integer | 원 단위, 1원 이상 (F1-3) |
| fixed_cost | integer default 0 | (F1-4) |
| food_budget_ratio | numeric(5,2) | 생성 시점에만 사용 (F1-5) |
| floating_budget | integer | = (total_budget-fixed_cost)×ratio, 소수점 버림 (F2) — 생성 시 1회 계산 후 이후엔 F4에서 절대값 관리 |
| status | text CHECK (ongoing/completed) | (F7) |
| created_at / updated_at | timestamptz | |

> **끼니별 가중치는 `trips`에 두지 않습니다.** F2-5(일차별 가중치 조건부 수정)가
> 날짜마다 다른 가중치를 허용하는 걸로 확정되어(해석 B), 가중치는 여행 전체 공통값이
> 아니라 `meal_slots`(날짜+끼니타입 단위) 각 행의 속성으로 저장합니다. F1-6의
> "기본값 선택"은 여행 생성 트랜잭션 안에서 전체 `meal_slots`를 만들 때 그 기본값을
> 각 행의 `weight_level`에 심어주는 방식으로 처리 (`trips`에 별도 저장 불필요).

## 3. `meal_slots`
끼니별 예산 슬롯 — 배분/캐스케이드/재분배(F2-2~F2-3, F6-4~F6-5)의 핵심 테이블

> **`weight_level`은 숫자가 아니라 프리셋 종류(가볍게/보통/든든하게)만 저장합니다.**
> 실제 값(0.8/1.0/1.2)은 고정 상수이고 사용자가 바꾸는 건 값이 아니라 선택뿐이라,
> 숫자를 DB에 직접 저장하면 나중에 정책 값이 바뀔 때 기존 행이 "변경 전/후 중
> 어느 값인지" 구분이 안 되는 문제가 생깁니다. 배분 계산 시 서버/클라이언트 코드의
> 상수 매핑(`{ light: 0.8, normal: 1.0, hearty: 1.2 }`)으로 변환해서 사용합니다.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| trip_id | uuid FK → trips | |
| date | date | |
| meal_type | text CHECK (breakfast/lunch/dinner) | |
| weight_level | text CHECK (light/normal/hearty) | 가볍게(0.8)/보통(1.0)/든든하게(1.2) 중 선택 (F1-6 기본값으로 생성, F2-5 조건부 수정 대상) — 숫자는 저장하지 않고 코드의 상수 매핑으로 변환 |
| budget_amount | integer | 원 배분액 |
| carried_over_amount | integer default 0 | 이월 여유식비 |
| is_recorded | boolean default false | 기록 여부 (F2-3, F6-5 삭제조건 판단, F2-5 수정 가능 조건) |
| is_cascade_confirmed | boolean default false | 자동 0원 확정 여부 (F6-4, G3 집계 제외 기준) |
| recorded_amount | integer nullable | 실제 지출액 |
| confirmed_at | timestamptz nullable | |
| created_at / updated_at | timestamptz | |
| | | UNIQUE(trip_id, date, meal_type) |

## 4. `meal_logs`
소비 기록 — 끼니 소비 + 끼니 외(기타) 소비 공용 (F6)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| trip_id | uuid FK → trips | |
| meal_slot_id | uuid FK → meal_slots, nullable | 끼니 소비만 채움, 기타소비는 null |
| restaurant_id | uuid FK → restaurants, nullable | 추천(F3)에서 온 기록만 연결, 채팅/OCR/수기입력은 캐시에 없는 식당일 수 있어 null 허용 |
| category | text CHECK (식비/교통/숙박/기념품/기타) | 끼니 선택 시 자동 '식비' |
| amount | integer | |
| store_name / store_address | text | `restaurant_id` 유무와 무관하게 항상 채움 (표시용, 비정규화). F6-10(매장명 검색·자동완성)으로 선택 시에도 텍스트만 채우고 옴 |
| store_latitude / store_longitude | numeric nullable | M2(방문 매장 지도)가 이 값으로 마커 표시. `restaurant_id` 있으면 `restaurants`에서 복사, F6-10 자동완성 선택 시엔 네이버 검색 API 결과 좌표로, 완전 수기입력·OCR만 쓴 경우엔 null (지도에 표시 안 됨) |
| is_good_price | boolean default false | 착한가격업소 방문 여부 — G10 배지, L1 착한가격이용 포인트 판정용. `restaurant_id` 있으면 `restaurants.source='good_price'`로 세팅, 없으면 알 수 없어 false |
| memo | text nullable | |
| source | text CHECK (home/recommend/chat/record) | F6-1 4개 경로 |
| receipt_image_url | text nullable | |
| ocr_raw | jsonb nullable | 클로바 OCR 원본 결과 (F6-2, F6-3) |
| created_at / updated_at | timestamptz | |

## 5. `budget_change_history`
예산 변동 히스토리 (F6-7, 되돌리기 불가 — append only)

> **`before_json` / `after_json`이 담는 내용:** 이벤트 전/후의 관련 예산 상태를
> 통째로 저장하는 자유 형식 스냅샷입니다. `amount_delta` 하나만으로는 F6-7이 요구하는
> "무엇이 얼마에서 얼마로 바뀌었는지" 조회 화면을 만들 수 없어서, `event_type`별로
> 안에 담기는 키가 다르게 들어갑니다(고정 스키마 아님, 그래서 jsonb).
> - `expense_input`(끼니 소비 기록): before `{budget_amount, carried_over_amount}` → after `{recorded_amount, carried_over_amount}` (F6-4 캐스케이드 이월 포함)
> - `budget_edit`(F4 일괄 수정): before `{total_budget, fixed_cost, floating_budget}` → after `{...변경된 값}`
> - `receipt_applied`(F6-2 OCR 반영): before `{amount: null}` → after `{amount, store_name}`
> - `log_deleted`(F6-6): before `{recorded_amount}` → after `{recorded_amount: null}` (재계산 후 상태)
>
> **`amount_delta`가 담는 내용:** 이벤트로 식비 예산(여유식비)이 얼마나 증가/감소했는지를
> 원 단위 부호(+/-) 있는 숫자로 나타낸 값입니다. `before_json`/`after_json`이 상태
> 스냅샷 전체라면, `amount_delta`는 목록 화면에서 매번 JSON을 파싱하지 않고 바로
> "-12,000원"처럼 보여주기 위한 변화량만 뽑아둔 값입니다.
> - `expense_input`: 지출만큼 감소, 예 `-12000`
> - `budget_edit`(증액): 예 `+50000`
> - `receipt_applied`(OCR 실제 금액이 예상보다 비쌌던 경우 차액): 예 `-3500`
> - `log_deleted`(기록 삭제로 예산 복원): 예 `+12000`

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| trip_id | uuid FK → trips | |
| event_type | text | expense_input / budget_edit / receipt_applied / log_deleted 등 |
| amount_delta | integer | |
| before_json / after_json | jsonb | |
| created_at / updated_at | timestamptz | append only라 updated_at은 사실상 created_at과 동일하게 유지됨. 모든 테이블 공통 규칙(id/created_at/updated_at)을 지키기 위해 포함 |

## 6. `chat_messages`
AI 채팅 (C1, C2, C3)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| trip_id | uuid FK → trips | |
| user_id | uuid FK → auth.users | |
| role | text CHECK (user/ai) | |
| content | text | |
| parsed_category / parsed_amount | text / integer nullable | AI 파싱 결과 (C2) |
| status | text CHECK (pending/confirmed/discarded) default 'pending' | 확정해야 meal_logs 반영 |
| created_at / updated_at | timestamptz | |

## 7. `diaries`
일기 (D0~D3)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| trip_id | uuid FK → trips | |
| date | date | |
| mode | text CHECK (manual/ai) | |
| content | text | |
| created_at / updated_at | timestamptz | |
| | | UNIQUE(trip_id, date) |

## 8. `badges` (마스터/시드 데이터)
G0~G17 배지 정의

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| code | text UNIQUE | 'G1', 'G2' ... |
| category | text | 예산준수형 / 소비패턴 등 |
| name / description | text | |
| bonus_points | integer | L4 배지-포인트 연동 |
| created_at / updated_at | timestamptz | 모든 테이블 공통 규칙(id/created_at/updated_at)을 지키기 위해 포함. 마스터 데이터라 실질적으로는 시드 시점 값 유지 |

## 9. `user_badges`
배지 획득 이력 (여행 완료 시 일괄 판정, 회수 없음)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → auth.users | |
| trip_id | uuid FK → trips | |
| badge_id | uuid FK → badges | |
| awarded_at | timestamptz default now() | |
| created_at / updated_at | timestamptz | 모든 테이블 공통 규칙(id/created_at/updated_at)을 지키기 위해 포함. `awarded_at`과 별개로 유지 (지급 시각은 `awarded_at`이 대표값) |
| | | UNIQUE(user_id, trip_id, badge_id) |

## 10. `exp_ledger`
포인트 원장 (L0~L2, append only)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → auth.users | |
| trip_id | uuid FK → trips, nullable | |
| event_type | text | trip_register / budget_set / meal_log / daily_close / good_price_use / new_try / rebalance / trip_complete / badge_earned 등 |
| points | integer | |
| created_at / updated_at | timestamptz | append only라 updated_at은 사실상 created_at과 동일하게 유지됨. 모든 테이블 공통 규칙(id/created_at/updated_at)을 지키기 위해 포함 |

> 레벨/캐릭터 진화 단계(L2, L3)는 별도 테이블 없이 `SUM(points)`를 애플리케이션/뷰에서
> 레벨 테이블에 매핑하는 방식을 제안합니다 (하드코딩된 구간표라 캐싱 불필요).

## 11. `region_cache`
자체 지역코드 마스터 테이블 (정적 시드 데이터)

> **"캐시"가 아니라 정적 시드 데이터입니다.** 서비스 운영 중 TourAPI를 호출해서
> 채워나가는 테이블이 아니라, 팀이 미리 정리해둔 정적 데이터셋(엑셀 등)을
> 배포/세팅 시점에 **한 번 시드 스크립트로 삽입**해두는 테이블입니다. 사용자가
> 지역을 입력(F1-1)할 때 이 테이블에서만 조회하며, 없는 지역이면 TourAPI로
> 폴백 호출하지 않고 **"조회할 수 없는 지역입니다"** 안내로 처리합니다. 즉 이
> 테이블은 캐시 겸 **서비스가 지원하는 지역 화이트리스트** 역할을 합니다.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| region_code | text UNIQUE | |
| region_name | text | |
| tour_api_snapshot | jsonb | 정적 데이터셋(엑셀 등)을 시드 스크립트로 변환해 넣은 값. 런타임 API 응답 아님 |
| created_at / updated_at | timestamptz | 모든 테이블 공통 규칙(id/created_at/updated_at)을 지키기 위해 포함. 정적 시드 데이터라 실질적 갱신은 드묾 |

## 12. `restaurants`
식당 캐시 — 착한가격업소 + TourAPI(contentTypeId=39) 통합 (F3, F3-1, F3-2, **F3-5**)

> **왜 캐시가 필요한가**: 착한가격업소 API는 지역 검색 파라미터가 없어 전량을
> 페이지네이션으로만 가져올 수 있고, 좌표도 없는 경우가 많아 별도 Geocoding이
> 필요합니다. TourAPI도 목록 조회와 상세 조회(메뉴/영업시간/소개)가 분리된 API라
> 매 추천 요청마다 라이브 호출하면 느리고 쿼터 소모가 큽니다. 그래서 두 소스를
> **24시간 주기 배치로 이 테이블에 캐싱**하고, 런타임에는 이 테이블만 조회합니다
> (기능명세서 v4의 **F3-5**로 공식 반영됨. `docs/business-logic-notes.md` §8,
> `docs/api-server-boundaries.md` 참고).
>
> **두 소스를 하나의 테이블로 통합한 이유**: F3-1(지도보기)이 두 소스를 같은
> 지도에 색상만 다르게 표시해야 해서, `source` 컬럼으로 구분하는 게 조회 단순함.
>
> **`category`는 정규화하지 않고 소스 원본 텍스트 그대로 저장합니다.** 화면에서
> 카테고리별 필터링은 하지 않고 단순 텍스트 표시로만 쓰이기 때문에, 착한가격업소는
> `한식`/`일식`/`중식`/`양식`/`기타요식업` 원본 그대로, TourAPI는 분류코드에
> 대응하는 명칭(FD01→한식, FD02→외국식, FD03은 신분류체계 세부명칭, FD04→주점,
> FD05→카페/찻집)을 그대로 저장합니다. 매핑 테이블 불필요.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| source | text CHECK (good_price/tour_api) | |
| external_id | text | tour_api는 `content_id` 그대로. good_price는 자체 고유ID가 없어 `name`+`address` 정규화 후 해시로 생성 |
| name | text | |
| address | text | |
| region_sido / region_sigungu | text | 주소 파싱 결과, `region_cache`와 매칭용 |
| category | text | 소스 원본 카테고리 텍스트 그대로 (매핑 없음, 위 설명 참고) |
| cls_system2 / cls_system3 | text nullable | tour_api 전용 원본 분류코드. `cls_system3`는 FD03 항목의 세부분류 표시에만 사용 (다른 코드에도 항상 존재하지만 미사용) |
| phone | text nullable | |
| latitude / longitude | numeric | good_price는 네이버 지도 Geocoding으로 보강, tour_api는 목록 API에 포함된 값 사용 |
| image_url | text nullable | tour_api 전용 |
| price_menus | jsonb nullable | good_price: `[{name, price}]` (F3 가격순 정렬용) · tour_api: 대표메뉴(상세조회 시) |
| business_hours | jsonb nullable | tour_api 전용, 상세조회 지연 로딩 |
| overview | text nullable | tour_api 전용, 상세조회 지연 로딩 |
| last_synced_at | timestamptz | 배치 캐싱 갱신 시각 |
| detail_synced_at | timestamptz nullable | 상세정보 지연 로딩 갱신 시각 (tour_api만 해당) |
| created_at / updated_at | timestamptz | |
| | | UNIQUE(source, external_id) |

---

## RLS 정책 방향

- `profiles`, `trips`, `exp_ledger`, `user_badges`: `auth.uid() = user_id`(또는 id) 본인만 read/write
- `meal_slots`, `meal_logs`, `budget_change_history`, `chat_messages`, `diaries`: `trip_id`로 조인해서 `trips.user_id = auth.uid()`인 경우만 접근
- `badges`, `region_cache`, `restaurants`: 전체 read 허용, write는 서버(service role)만 (배치/시드 전용)

## 세션 1에서 논의가 필요한 점

- [x] `meal_weight_*` — **해석 B(일자별 가중치) 확정**. `trips`에 두던 3컬럼은 제거하고, `meal_slots`에 `weight_level` 컬럼 1개를 추가해 날짜+끼니타입 단위로 관리. 값은 숫자(0.8/1.0/1.2)가 아니라 프리셋 종류(light/normal/hearty)만 저장, 숫자는 코드 상수로 관리
- [x] `region_cache` 성격 — **정적 시드 데이터로 확정**. 팀이 준비한 엑셀 등 정적 데이터셋을 배포/세팅 시 한 번 시드로 삽입, 운영 중 TourAPI 호출로 갱신하지 않음. 지원하지 않는 지역 조회 시 API 폴백 없이 "조회할 수 없는 지역입니다" 에러 처리 (F1-1, F3 추천 화면에 반영 필요). (수정: 이후 "모든 테이블에 id/created_at/updated_at 포함" 규칙이 전체 테이블 공통 규칙으로 확정되면서 `updated_at`도 다시 포함시킴 — 정적 데이터라 실질 갱신은 드물지만 스키마 일관성 우선)
- [x] AI 채팅(C1/C2) LLM 호출 — **서버(`apps/server`) 경유로 결정**. 서버가 현재 예산/끼니 상태를 프롬프트에 포함해 호출하고 파싱 결과를 검증 후 반환. 지연시간 체감을 줄이기 위해 서버→클라이언트 구간은 SSE로 스트리밍 릴레이 권장 (`docs/api-server-boundaries.md` 참고)
- [x] `meal_logs.is_good_price` 추가, `restaurants` 캐시 테이블 신설 — 착한가격업소는 위치검색 파라미터가 없어 전량 페이지네이션 수집 후 주소 파싱+Geocoding으로 좌표 보강, TourAPI(FD 39)와 통합 캐싱. 24시간 배치, `category`는 매핑 없이 소스 원본 텍스트 그대로 저장 (§12 참고). FD04(주점)·FD05(카페/찻집) 포함
- [x] **기능명세서 v4(0812) 반영** — F3-5(착한가격업소 배치 캐싱)는 위 `restaurants` 설계와 일치해 별도 스키마 변경 없이 공식 기능 ID만 인용 반영. F6-10(매장명 검색·자동완성)은 새 갭 발견 — `meal_logs`에 `store_latitude`/`store_longitude` 컬럼 추가 (§4 참고). M2(방문 매장 지도)가 좌표를 필요로 하는데 기존엔 `restaurant_id`가 없는 기록(채팅/수기/OCR)의 좌표를 확보할 방법이 없었음. F6-10으로 네이버 검색 API 결과에서 좌표를 받아 채우면 이 갭이 해소됨
- [x] **모든 테이블 `id`/`created_at`/`updated_at` 통일** — 위 §5·§8·§9·§10·§11에 빠져 있던 `updated_at`(일부는 `created_at`도)을 전 테이블 공통 규칙에 맞춰 추가. `updated_at`은 UPDATE 시 자동 갱신되도록 `set_updated_at()` 트리거를 모든 테이블에 부착 (`supabase/migrations/20260812000000_initial_schema.sql` 참고)
- [x] **`good_price_shops` 별도 테이블 검토 후 폐기** — 한때 F3-5 배치 캐싱 전용으로 메뉴 단위 flat 테이블(`good_price_shops`)을 추가 검토했으나, §12 `restaurants`(착한가격업소+TourAPI 통합 캐시)와 역할이 중복되어 제거. 착한가격업소+TourAPI 캐싱은 `restaurants` 테이블 하나로 통일
