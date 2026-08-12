# 기능별 담당자 배정표 (세션 1에서 채우기)

킥오프 세션 체크리스트의 "기능별 담당자 배정" 항목용 뼈대입니다.
이름/기능만 채우면 폴더명은 `CLAUDE.md`의 매핑표와 자동으로 맞습니다.

> 기능명세서 v4(0812) 기준으로 갱신 — F3-5(착한가격업소 배치 캐싱), F6-10(매장명
> 검색·자동완성) 반영. 각 기능의 서버 협업 필요도는 `docs/api-server-boundaries.md`,
> 재계산 로직 상세는 `docs/business-logic-notes.md` 참고.

| 기능 대분류 | 기능 ID 범위 | 폴더명 | 담당자 | 비고 |
|---|---|---|---|---|
| 회원 인증 | F0 ~ F0-5 | `auth` | | |
| 여행 생성 | F1 ~ F1-6 | `trip-create` | | `region_cache`(정적 시드) 조회만, 라이브 API 없음 |
| 예산 산정 | F2 ~ F2-5 | `budget` | | 캐스케이드·재분배 로직 핵심 (`business-logic-notes.md` §1~2) |
| 예산 수정 | F4 ~ F4-2 | `budget-edit` | | 재분배 로직(§2) 재사용, `budget` 담당자와 협업 권장 |
| 음식점 추천 | F3 ~ F3-5 | `recommend` | | **업무량 큼** — F3-5(착한가격업소 전량 수집+주소파싱+Geocoding+TourAPI 통합 배치) 포함, 서버 프록시(`recommend` API, `restaurants` 배치 스크립트) 협업 필요. 배치 스크립트는 별도 시간 배분 권장 (아래 참고) |
| 채팅 | C0 ~ C3 | `chat` | | AI/서버 협업 필요, SSE 스트리밍 클라이언트 처리 포함 |
| 기록 | F6 ~ F6-10 | `record` | | **볼륨 가장 큼** — OCR 연동, F6-10(네이버 검색 서버 프록시) 신규 추가, F6-4~F6-6 재계산 로직(`business-logic-notes.md` §1, §3, §4) 포함. M2(마이페이지 방문 매장 지도)와 좌표 스키마 공유하니 `mypage` 담당자와 조율 필요 |
| 일기 | D0 ~ D3 | `diary` | | 기록 탭 소속 (마이페이지 아님) |
| 여행 완료 | F7 ~ F7-1 | `trip-complete` | | 배지/포인트 트리거 지점, 지연 평가 로직은 서버(§`server-api-spec.md`) |
| 게이미피케이션-배지 | G0 ~ G17 | `badges` | | 선택 기능, 우선순위 조정 가능. 판정 로직 상세는 `business-logic-notes.md` §6 |
| 캐릭터 성장 | L0 ~ L4 | `character` | | 선택 기능, 우선순위 조정 가능. 포인트 매핑은 `business-logic-notes.md` §7 |
| 마이페이지 | M0 ~ M2 | `mypage` | | 선택 기능, 우선순위 조정 가능. M2는 `record`가 채우는 `meal_logs.store_latitude/longitude`에 의존 (`business-logic-notes.md` §10) |
| 서버(공통) | - | `apps/server` | | TourAPI·착한가격업소·클로바 OCR·AI채팅·네이버 지도 Geocoding/검색(F6-10) 프록시 + `restaurants` 24시간 배치(F3-5) + 여행완료 지연평가(F7) — `server-api-spec.md` 전체 참고 |

## 배정 시 참고

- **핵심(우선순위 최고)** 기능: F3-3(추천 기준 산정), C2(자연어 파싱), F6-4(캐스케이드 확정) — 예산 재계산과 직결
- **필수** 기능부터 먼저 배정하고, **선택** 기능(G, L, M, D 일부)은 시간 남으면 진행
- 한 사람이 `recommend` + `chat`을 동시에 맡으면 서버 프록시 설계 부담이 커질 수 있으니 분산 권장
- **F3-5 배치 스크립트**(착한가격업소 전량 수집+Geocoding+upsert)는 `recommend` 담당자 혼자 시간 내 끝내기엔 분량이 있어서, 세션 초반에 팀 전체 또는 서버 담당과 함께 붙어서 처리하고 이후 화면 작업은 `recommend` 담당자가 이어가는 방식을 제안 (`business-logic-notes.md` §8, 결정이 필요한 것 항목 참고)
- **F6-10과 M2는 스키마를 공유**하므로(`meal_logs.store_latitude/longitude`), `record`와 `mypage`를 같은 사람이 맡거나 최소한 컬럼 채우는 시점에 대해 미리 합의해두는 걸 권장

