# 핵심 비즈니스 로직 노트 (v1)

`schema-design.md`의 테이블 설계만으로는 "누가 언제 이 로직을 실행하는지"가
드러나지 않아서, 재계산이 걸리는 지점들을 규칙으로 정리했습니다. 실제 구현은
Postgres 함수(RPC)로 할지 Apollo mutation 여러 개를 클라이언트가 순차 실행할지
세션에서 결정 필요 — 이 문서는 "무엇을 계산해야 하는가"에 집중합니다.

## 1. F6-4 끼니 캐스케이드 확정

**트리거**: 특정 `meal_slots` 행에 `meal_logs`가 직접 기록될 때

**규칙**:
1. 기록된 슬롯보다 이전 날짜/끼니 순서(아침→점심→저녁→다음날 아침...)로 `is_recorded=false`인 슬롯을 전부 조회
2. 그 슬롯들을 `recorded_amount=0`, `is_cascade_confirmed=true`, `is_recorded=true`로 확정
3. 각 슬롯의 `budget_amount`(미사용분)를 합산해 다음 미확정 슬롯의 `carried_over_amount`에 더함 (날짜 경계 무관)
4. `budget_change_history`에 `event_type='expense_input'` 로그 추가 (before/after는 관련 슬롯들의 상태 스냅샷)

## 2. F2-3 남은 끼니 기준 재분배

**트리거**: F4(예산 일괄 수정)로 `total_budget`/`fixed_cost`/`floating_budget` 변경

**규칙**:
1. `is_recorded=true`인 슬롯은 **소급 변경하지 않음** (그대로 유지)
2. `is_recorded=false`인 슬롯만 대상으로, 변경된 `floating_budget`에서 이미 확정된 슬롯들의 `budget_amount` 합을 뺀 나머지를 남은 슬롯 수·가중치(`weight_level`)로 재배분
3. `budget_change_history`에 `event_type='budget_edit'` 로그 추가

## 3. F6-5 끼니 삭제 + 재계산

**트리거**: 사용자가 특정 `meal_slots`의 기록 삭제 요청

**허용 조건**: 바로 다음 끼니의 `is_recorded === false`일 때만 삭제 가능 (그 다음 끼니가 이미 기록됐으면 삭제 불가 — 순서 꼬임 방지)

**규칙**:
1. 확인 모달 노출 (클라이언트)
2. 해당 슬롯 `recorded_amount=null`, `is_recorded=false`, `is_cascade_confirmed=false`로 되돌림
3. 그 이후 슬롯들의 `carried_over_amount`를 전부 재계산 (캐스케이드 로직 역산)
4. `budget_change_history`에 `event_type='log_deleted'` 로그 추가

## 4. F6-6 소비/영수증 기록 삭제 + 재계산

**트리거**: `meal_logs` 삭제 (끼니 소비든 기타소비든)

**규칙**:
1. 완료된 여행(`trips.status='completed'`)은 삭제 불가 (F7-1) — 서버/RPC 단에서 재확인 (클라이언트 검증만 믿지 않음)
2. 삭제 대상이 `meal_slot_id`를 가진 끼니 소비면 → 3번(F6-5) 로직과 동일하게 해당 슬롯 재계산
3. 기타소비면 슬롯 재계산은 불필요, `budget_change_history`만 append

## 5. F4-2 예산 일괄 수정 반영

**트리거**: F4 폼에서 CTA 확정

**규칙**:
1. 클라이언트가 `전체예산 < 고정비용+유동비용`이면 CTA 비활성화 (F4-1, 로컬 검증)
2. 서버/RPC가 재검증 후 `trips` 갱신 → 2번(F2-3) 재분배 로직 실행 → 상단 수치 즉시 갱신용 최신 값 응답
3. 반영 실패 시 클라이언트는 재시도 또는 이전 화면 복귀 제공 (F4-2)

## 6. G0~G17 배지 판정 (여행 완료 시 일괄)

**트리거**: `server-api-spec.md`의 여행 완료 지연 평가 시점

**판정 데이터 소스** (기능명세서 "사용 API/데이터" 컬럼 기준):
| 배지 | 판정 기준 데이터 |
|---|---|
| G1 예산 완주자 | `budget_change_history` + 총지출 합계 (`meal_logs` SUM) |
| G2 딱 맞춤 플래너 | `trips.total_budget` vs 총지출 ±5% |
| G3 짠테크 고수 | `trips.floating_budget` vs 식비 실지출 80% 이하 (`is_cascade_confirmed=true` 슬롯은 집계 제외) |
| G4 위기탈출 | 일별 예산 초과 후 다음 끼니로 당일 회복 (`meal_slots` 일자별 그룹핑 후 판정) |
| G5~G6 소비패턴형 | `meal_logs.category` 비교/시간대 분석 |
| G7~G9 계획변경 유연성 | `budget_change_history` 이벤트 횟수 |
| G10~G11 착한가격/가성비 | `meal_logs.is_good_price` (확정 반영됨) / `restaurants.price_menus`(가성비 판정) |
| G12~G13 지역 탐방 | `meal_logs` + `trips.region_code` (여러 여행에 걸친 판정이라 `user_id` 기준 전체 trips 조회 필요) |
| G14~G15 습관/연속기록 | `meal_logs` 기록 일자 분포, 완주 여행 수(`trips` count) |
| G16~G17 온보딩 | F1/F2/C2 최초 사용 여부 |

**공통 규칙**: 배지·포인트는 한 번 지급되면 이후 기록 수정/조건 변경에도 회수하지 않음 (append only, 이미 스키마에 반영됨)

## 7. L1 포인트 적립 규칙 매핑

| 이벤트 | `exp_ledger.event_type` | 포인트 | 트리거 시점 |
|---|---|---|---|
| 여행등록 | `trip_register` | +30 (여행 1회) | 여행 생성 시 |
| 예산산정 | `budget_set` | +10 (여행 1회) | F2 최초 계산 시 |
| 끼니기록 | `meal_log` | +10 (일 3회 한도, 캐스케이드 제외) | `meal_logs` insert 시, `is_cascade_confirmed=false`인 경우만 |
| 하루예산내마감 | `daily_close` | +20 (일 1회) | 해당 날짜 3끼 모두 `is_recorded=true`이고 하루 합계가 일별 예산 이내일 때 |
| 착한가격이용 | `good_price_use` | +15 (끼니당) | `is_good_price=true`인 `meal_logs` insert 시 |
| 신규시도 | `new_try` | +10 (끼니당) | 새 매장 최초 방문 판정 (동일 `store_name` 재방문 아님) |
| 재조정완료 | `rebalance` | +5 (일 1회) | F2-3 재분배 실행 시 |
| 여행완주 | `trip_complete` | +100 (여행 1회) | 여행 완료 처리 시 |
| ±10%완주보너스 | `trip_complete_bonus` | +50 (여행 1회) | G2 조건 충족 시 |
| 배지획득 | `badge_earned` | +20~100 (배지별 `bonus_points`) | `user_badges` insert 시 |

## 8. `restaurants` 캐시 배치 (F3, F3-1)

**트리거**: 24시간 주기 스케줄 (Supabase Scheduled Edge Function + `pg_cron` 권장)

**규칙**:
1. **행안부 착한가격업소**: 위치 검색 파라미터가 없어 `page`를 1부터 끝까지 순회하며 전량 수집 (`perPage` 최대치 기준)
2. **주소 파싱**: `address`에서 `region_sido`/`region_sigungu` 추출 → `region_cache`와 매칭 가능한 키로 저장
3. **좌표 보강**: 좌표 없는 레코드만 네이버 지도 Geocoding API로 주소→위도/경도 변환 (좌표 이미 있는 지자체 데이터는 스킵해 호출량 절약)
4. **TourAPI(contentTypeId=39)**: 지역기반 관광정보조회로 목록(좌표 포함) 수집. 상세정보(소개/영업시간)는 배치에 포함하지 않고, 사용자가 상세 진입 시 `detail_synced_at` 기준 지연 로딩 + 캐싱 (`server-api-spec.md` 참고)
5. **upsert**: `(source, external_id)` 유니크 키로 upsert — good_price는 `name+address` 정규화 해시, tour_api는 `content_id`
6. `last_synced_at` 갱신

**F3(추천), F3-1(지도)** 조회 시점에는 이 배치 결과만 조회 — 외부 API 라이브 호출 없음

## 9. F6-10 매장명 검색·자동완성 → 좌표 확보

**트리거**: F6 소비 기록 폼에서 매장명 입력 시 서버 경유 네이버 지도 검색 API 호출 (`docs/api-server-boundaries.md` 참고)

**규칙**:
1. 후보 목록에서 선택하면 응답의 `store_name`, `store_address`, `store_latitude`, `store_longitude`를 폼에 채움
2. 검색 결과에 없는 매장은 직접 입력 가능(F6-10 명세) — 이 경우 좌표는 null로 유지, M2 지도에는 표시되지 않음
3. 이 경로로는 `restaurant_id`/`is_good_price`가 채워지지 않음 — 네이버 검색 API의 place 식별자와 `restaurants.external_id`(TourAPI `content_id` / 착한가격업소 해시) 체계가 달라 매칭 근거가 없음. 필요하면 이름+주소 유사도 매칭으로 사후 연결하는 걸 고려할 수 있으나 이번 스코프에서는 제외 권장

## 10. M2 방문 매장 지도 — 마커 그룹핑 기준

**트리거**: 마이페이지 M2 조회

**규칙**:
1. `store_latitude`/`store_longitude`가 있는 `meal_logs`만 마커 후보 (F6-10 자동완성 또는 `restaurant_id` 연결분만 해당, 완전 수기입력/OCR만 쓴 기록은 제외)
2. **동일 매장 판단 기준**: `restaurant_id`가 있으면 그 값으로 그룹핑, 없으면 `store_name`+`store_address` 정규화 문자열(공백/특수문자 제거, 소문자 등)로 그룹핑. 좌표 자체로 그룹핑하지 않는 이유는 (a) 동일 상호의 다른 지점이 같은 좌표 근방에 있을 수 있고 (b) Geocoding 오차로 동일 매장이 미세하게 다른 좌표를 가질 수 있어서
3. 마커당 방문 횟수 = 그룹 내 `meal_logs` 건수, 누적 소비 금액 = `amount` SUM
4. 신규/재방문 색상 구분: 그룹의 첫 방문 기록이 이번 조회 대상 기간 내 처음인지 여부 (명세상 "신규/재방문은 색상만 구분", 강조 없음)

## 결정이 필요한 것

- [ ] 위 로직들을 Postgres 함수(RPC)로 구현할지, 서버(`apps/server`)에서 처리할지 — 트랜잭션 원자성 때문에 개인적으로는 Postgres 함수 권장 (특히 1~5번은 여러 테이블에 걸친 원자적 갱신이 필요)
- [ ] "신규시도"(같은 매장 재방문 여부) 판단 시 매장 식별 기준 — `store_name` 문자열 일치로 충분한지, `restaurant_id` 기반으로 해야 할지 (10번의 M2 그룹핑 기준과 동일 로직 재사용 권장)
- [ ] `restaurants` 배치 스크립트 담당자 배정 (`team-assignment.md` F3 담당자 업무량에 반영 필요)
- [ ] 9번의 "이름+주소 유사도 매칭으로 `restaurant_id` 사후 연결" 여부 — 이번 세션 스코프에 포함할지, 이후 개선 과제로 남길지
