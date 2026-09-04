import { buildCategoryBreakdown, buildMealTimeAverages, buildTripRatios, type MealLogInput, type TripInput } from "./spendingHabits";

describe("buildTripRatios", () => {
  it("여행을 종료일 최신순으로 정렬하고, 트립별 지출 합계와 예산 대비 비율을 계산한다", () => {
    const trips: TripInput[] = [
      { id: "t1", name: "여행1", status: "completed", startDate: "2026-01-01", endDate: "2026-01-03", totalBudget: 100000 },
      { id: "t2", name: "여행2", status: "completed", startDate: "2026-02-01", endDate: "2026-02-05", totalBudget: 50000 },
    ];
    const mealLogs: MealLogInput[] = [
      { tripId: "t1", amount: 30000, category: "식비", hasReceipt: true, mealType: "lunch" },
      { tripId: "t1", amount: 20000, category: "교통", hasReceipt: false, mealType: null },
      { tripId: "t2", amount: 60000, category: "식비", hasReceipt: true, mealType: "dinner" },
    ];

    const result = buildTripRatios(trips, mealLogs);

    expect(result.map((r) => r.id)).toEqual(["t2", "t1"]); // 종료일 최신순(t2가 먼저)
    expect(result.find((r) => r.id === "t1")).toEqual({ id: "t1", label: "여행1", spent: 50000, budget: 100000, ratio: 50 });
    expect(result.find((r) => r.id === "t2")).toEqual({ id: "t2", label: "여행2", spent: 60000, budget: 50000, ratio: 120 }); // 예산 초과도 100% 넘게 그대로 계산
  });

  it("예산이 0이어도 나누기 에러 없이 비율 0을 반환한다", () => {
    const trips: TripInput[] = [
      { id: "t1", name: "여행1", status: "completed", startDate: "2026-01-01", endDate: "2026-01-01", totalBudget: 0 },
    ];

    expect(buildTripRatios(trips, [])[0]?.ratio).toBe(0);
  });
});

describe("buildCategoryBreakdown", () => {
  it("카테고리별로 합산하고, 금액 0인 카테고리는 제외한 뒤 금액 내림차순으로 정렬한다", () => {
    const mealLogs: MealLogInput[] = [
      { tripId: "t1", amount: 30000, category: "식비", hasReceipt: true, mealType: "lunch" },
      { tripId: "t1", amount: 10000, category: "식비", hasReceipt: true, mealType: "dinner" },
      { tripId: "t1", amount: 20000, category: "교통", hasReceipt: false, mealType: null },
      { tripId: "t1", amount: 0, category: "숙박", hasReceipt: false, mealType: null },
    ];

    const result = buildCategoryBreakdown(mealLogs);

    expect(result).toEqual([
      { category: "식비", amount: 40000, percent: 67 },
      { category: "교통", amount: 20000, percent: 33 },
    ]);
  });

  it("기록이 없으면 빈 배열을 반환한다", () => {
    expect(buildCategoryBreakdown([])).toEqual([]);
  });
});

describe("buildMealTimeAverages", () => {
  it("끼니 시간대별 평균을 계산하고, 끼니 슬롯이 없는 기타소비는 집계에서 제외한다", () => {
    const mealLogs: MealLogInput[] = [
      { tripId: "t1", amount: 10000, category: "식비", hasReceipt: true, mealType: "breakfast" },
      { tripId: "t1", amount: 20000, category: "식비", hasReceipt: true, mealType: "breakfast" },
      { tripId: "t1", amount: 15000, category: "교통", hasReceipt: false, mealType: null }, // 기타소비, 제외 대상
    ];

    const result = buildMealTimeAverages(mealLogs);

    expect(result.find((r) => r.mealType === "breakfast")?.average).toBe(15000); // (10000+20000)/2
    expect(result.find((r) => r.mealType === "lunch")?.average).toBe(0); // 기록 없음
  });
});
