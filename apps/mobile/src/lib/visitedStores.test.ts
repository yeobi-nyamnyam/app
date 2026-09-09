import { buildVisitedStoreGroups, type MealLogInput } from "./visitedStores";

describe("buildVisitedStoreGroups", () => {
  it("좌표 없는 기록은 제외한다", () => {
    const logs: MealLogInput[] = [
      {
        storeName: "수기입력 매장",
        storeAddress: null,
        storeLatitude: null,
        storeLongitude: null,
        restaurantId: null,
        amount: 10000,
        visitDate: "2026-07-26",
      },
    ];

    expect(buildVisitedStoreGroups(logs)).toEqual([]);
  });

  it("restaurant_id가 있으면 그 값으로 그룹핑한다", () => {
    const logs: MealLogInput[] = [
      {
        storeName: "가마솥 순대국밥",
        storeAddress: "서면로 1길",
        storeLatitude: 35.1,
        storeLongitude: 129.05,
        restaurantId: "r1",
        amount: 8000,
        visitDate: "2026-07-26",
      },
      {
        storeName: "가마솥 순대국밥 (서면점)",
        storeAddress: "서면로 1길",
        storeLatitude: 35.1001,
        storeLongitude: 129.0501,
        restaurantId: "r1",
        amount: 6000,
        visitDate: "2026-07-27",
      },
    ];

    const result = buildVisitedStoreGroups(logs);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      key: "r1",
      storeName: "가마솥 순대국밥 (서면점)",
      visitCount: 2,
      totalAmount: 14000,
      visitDates: ["2026-07-26", "2026-07-27"],
      isRevisit: true,
    });
  });

  it("restaurant_id가 없으면 매장명+주소 정규화 문자열로 그룹핑한다", () => {
    const logs: MealLogInput[] = [
      {
        storeName: "밀면집",
        storeAddress: "부산 남포동 1가",
        storeLatitude: 35.2,
        storeLongitude: 129.1,
        restaurantId: null,
        amount: 7600,
        visitDate: "2026-07-27",
      },
      {
        storeName: "밀면집",
        storeAddress: "부산 남포동 1가",
        storeLatitude: 35.2,
        storeLongitude: 129.1,
        restaurantId: null,
        amount: 5000,
        visitDate: "2026-08-01",
      },
      {
        storeName: "다른 매장",
        storeAddress: "다른 주소",
        storeLatitude: 35.3,
        storeLongitude: 129.2,
        restaurantId: null,
        amount: 4000,
        visitDate: "2026-07-26",
      },
    ];

    const result = buildVisitedStoreGroups(logs);

    expect(result).toHaveLength(2);
    const milmyeon = result.find((group) => group.storeName === "밀면집");
    expect(milmyeon).toMatchObject({ visitCount: 2, totalAmount: 12600, isRevisit: true });
  });

  it("최근 방문일 내림차순으로 정렬한다", () => {
    const logs: MealLogInput[] = [
      {
        storeName: "A",
        storeAddress: "A동",
        storeLatitude: 1,
        storeLongitude: 1,
        restaurantId: null,
        amount: 1000,
        visitDate: "2026-07-01",
      },
      {
        storeName: "B",
        storeAddress: "B동",
        storeLatitude: 2,
        storeLongitude: 2,
        restaurantId: null,
        amount: 2000,
        visitDate: "2026-08-01",
      },
    ];

    expect(buildVisitedStoreGroups(logs).map((group) => group.storeName)).toEqual(["B", "A"]);
  });

  it("단일 방문은 isRevisit이 false다", () => {
    const logs: MealLogInput[] = [
      {
        storeName: "자갈치 어묵",
        storeAddress: "자갈치시장",
        storeLatitude: 35.1,
        storeLongitude: 129.0,
        restaurantId: null,
        amount: 4000,
        visitDate: "2026-07-26",
      },
    ];

    expect(buildVisitedStoreGroups(logs)[0]).toMatchObject({ visitCount: 1, isRevisit: false });
  });
});
