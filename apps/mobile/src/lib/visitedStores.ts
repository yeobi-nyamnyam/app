export interface MealLogInput {
  storeName: string | null;
  storeAddress: string | null;
  storeLatitude: number | null;
  storeLongitude: number | null;
  restaurantId: string | null;
  amount: number;
  visitDate: string;
}

export interface VisitedStoreGroup {
  key: string;
  storeName: string;
  storeAddress: string | null;
  /** 좌표를 알 수 있는 방문 기록이 그룹 내에 하나도 없으면 null (지도에는 못 올리고 목록에만 표시) */
  latitude: number | null;
  longitude: number | null;
  visitCount: number;
  totalAmount: number;
  /** 오래된 순으로 정렬된 방문일("YYYY-MM-DD") 목록 */
  visitDates: string[];
  /** 2회 이상 방문한 매장인지 — true면 "재방문" 범례 색상 적용 (business-logic-notes.md §10) */
  isRevisit: boolean;
}

const normalize = (text: string): string => text.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();

const groupKey = (log: MealLogInput): string =>
  log.restaurantId ?? `${normalize(log.storeName ?? "")}|${normalize(log.storeAddress ?? "")}`;

const hasCoordinates = (log: MealLogInput): log is MealLogInput & { storeLatitude: number; storeLongitude: number } =>
  log.storeLatitude != null && log.storeLongitude != null;

/**
 * 방문 매장 지도(M2)용 매장 그룹핑. 끼니(식비) 기록은 매장명 기록이 필수가 될
 * 예정이라 좌표 유무와 무관하게 전부 그룹핑 대상으로 삼는다 — 좌표는 지도 마커를
 * 찍을 수 있는지에만 쓰고(그룹 내 가장 최근의 좌표 있는 기록을 대표값으로 사용,
 * 하나도 없으면 null), 목록에는 좌표가 없어도 항상 노출한다. restaurant_id(있으면)
 * 또는 매장명+주소 정규화 문자열로 그룹핑해 방문 횟수·누적 금액을 계산하고 최근
 * 방문일 내림차순으로 정렬한다 (business-logic-notes.md §10).
 */
export const buildVisitedStoreGroups = (logs: MealLogInput[]): VisitedStoreGroup[] => {
  // 매장명이 없으면 목록에 표시할 게 없어 그룹핑 자체가 불가능 (정규화 문자열이
  // 빈 값끼리 뭉쳐버리는 것도 방지).
  const named = logs.filter((log) => (log.storeName ?? "").trim().length > 0);

  const groups = new Map<string, MealLogInput[]>();
  named.forEach((log) => {
    const key = groupKey(log);
    const existing = groups.get(key);
    if (existing) {
      existing.push(log);
    } else {
      groups.set(key, [log]);
    }
  });

  const result = Array.from(groups.entries()).map(([key, groupLogs]) => {
    const sorted = [...groupLogs].sort((a, b) => (a.visitDate < b.visitDate ? -1 : a.visitDate > b.visitDate ? 1 : 0));
    // groups는 최소 1개 로그로만 생성되므로 reduce에 초기값 없이 써도 항상 값이 있다
    // (인덱스 접근과 달리 reduce는 빈 배열이 아니면 undefined를 반환하지 않는다).
    const latest = sorted.reduce((a, b) => (b.visitDate >= a.visitDate ? b : a));
    // 좌표는 그룹 내 가장 최근 방문 기록 것을 우선 쓰고(Geocoding 오차 대응, §10 참고),
    // 최근 기록에 좌표가 없으면(OCR/직접입력) 과거 방문 중 좌표 있는 것으로 대체한다 —
    // 한 번이라도 위치를 알 수 있었으면 지도에 표시해준다.
    const withCoords = [...sorted].reverse().find(hasCoordinates);
    return {
      key,
      storeName: latest.storeName ?? "",
      storeAddress: latest.storeAddress,
      latitude: withCoords?.storeLatitude ?? null,
      longitude: withCoords?.storeLongitude ?? null,
      visitCount: sorted.length,
      totalAmount: sorted.reduce((sum, log) => sum + log.amount, 0),
      visitDates: sorted.map((log) => log.visitDate),
      isRevisit: sorted.length >= 2,
      latestVisitDate: latest.visitDate,
    };
  });

  return result
    .sort((a, b) => (a.latestVisitDate < b.latestVisitDate ? 1 : a.latestVisitDate > b.latestVisitDate ? -1 : 0))
    .map((group) => ({
      key: group.key,
      storeName: group.storeName,
      storeAddress: group.storeAddress,
      latitude: group.latitude,
      longitude: group.longitude,
      visitCount: group.visitCount,
      totalAmount: group.totalAmount,
      visitDates: group.visitDates,
      isRevisit: group.isRevisit,
    }));
};
