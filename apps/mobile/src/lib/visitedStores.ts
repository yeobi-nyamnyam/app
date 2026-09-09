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
  storeAddress: string;
  latitude: number;
  longitude: number;
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

/**
 * 방문 매장 지도(M2)용 매장 그룹핑. business-logic-notes.md §10 규칙을 따른다:
 * 좌표 있는 기록만 대상으로, restaurant_id(있으면) 또는 매장명+주소 정규화
 * 문자열로 그룹핑해 방문 횟수·누적 금액을 계산하고 최근 방문일 내림차순으로 정렬한다.
 */
export const buildVisitedStoreGroups = (logs: MealLogInput[]): VisitedStoreGroup[] => {
  const withCoordinates = logs.filter(
    (log): log is MealLogInput & { storeLatitude: number; storeLongitude: number } =>
      log.storeLatitude != null && log.storeLongitude != null,
  );

  const groups = new Map<string, MealLogInput[]>();
  withCoordinates.forEach((log) => {
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
    return {
      key,
      storeName: latest.storeName ?? "",
      storeAddress: latest.storeAddress ?? "",
      // 그룹 내 최신 기록의 좌표를 대표값으로 쓴다 — Geocoding 오차로 동일 매장이
      // 미세하게 다른 좌표를 가질 수 있어서 (§10 참고).
      latitude: latest.storeLatitude as number,
      longitude: latest.storeLongitude as number,
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
