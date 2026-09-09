import {
  computeDayBudgets,
  computeMealBudgets,
  findNextUnrecordedMealSlot,
  getRecommendBudgetAmount,
  getTripDates,
  redistributeUnrecordedSlots,
  type RedistributableSlot,
  type UnrecordedMealSlot,
} from "./budget";

describe("computeMealBudgets", () => {
  it("가중치 비율대로 배분하고 나머지는 저녁에 더한다", () => {
    const result = computeMealBudgets(10000, { breakfast: "light", lunch: "normal", dinner: "hearty" });

    expect(result).toEqual({ breakfast: 2666, lunch: 3333, dinner: 4001 });
    expect(result.breakfast + result.lunch + result.dinner).toBe(10000);
  });

  it("나누어떨어지는 금액이면 나머지 없이 그대로 배분한다", () => {
    const result = computeMealBudgets(30000, { breakfast: "light", lunch: "normal", dinner: "hearty" });

    expect(result).toEqual({ breakfast: 8000, lunch: 10000, dinner: 12000 });
  });
});

describe("computeDayBudgets", () => {
  it("나누어떨어지지 않으면 나머지를 마지막 날에 더한다", () => {
    expect(computeDayBudgets(100000, 3)).toEqual([33333, 33333, 33334]);
  });

  it("하루짜리 여행이면 전체 금액을 그대로 반환한다", () => {
    expect(computeDayBudgets(10000, 1)).toEqual([10000]);
  });
});

describe("redistributeUnrecordedSlots", () => {
  const slot = (overrides: Partial<RedistributableSlot>): RedistributableSlot => ({
    id: "id",
    isRecorded: false,
    budgetAmount: 0,
    weightLevel: "normal",
    ...overrides,
  });

  it("is_recorded 슬롯은 소급 변경하지 않고, 남은 예산을 미기록 슬롯에 가중치대로 재분배한다", () => {
    const slots = [
      slot({ id: "a", isRecorded: true, budgetAmount: 5000, weightLevel: "normal" }),
      slot({ id: "b", isRecorded: false, weightLevel: "light" }),
      slot({ id: "c", isRecorded: false, weightLevel: "hearty" }),
    ];

    const result = redistributeUnrecordedSlots(slots, 20000);

    expect(result.find((s) => s.id === "a")?.budgetAmount).toBe(5000);
    expect(result.find((s) => s.id === "b")?.budgetAmount).toBe(6000);
    expect(result.find((s) => s.id === "c")?.budgetAmount).toBe(9000);
  });

  it("이미 기록된 금액이 새 예산을 초과해도 음수로 배분하지 않는다", () => {
    const slots = [
      slot({ id: "x", isRecorded: true, budgetAmount: 10000 }),
      slot({ id: "y", isRecorded: false }),
    ];

    const result = redistributeUnrecordedSlots(slots, 5000);

    expect(result.find((s) => s.id === "y")?.budgetAmount).toBe(0);
  });

  it("미기록 슬롯이 하나도 없으면 배열을 그대로 반환한다", () => {
    const slots = [slot({ id: "a", isRecorded: true, budgetAmount: 5000 })];

    expect(redistributeUnrecordedSlots(slots, 99999)).toEqual(slots);
  });
});

describe("findNextUnrecordedMealSlot", () => {
  const slot = (overrides: Partial<UnrecordedMealSlot>): UnrecordedMealSlot => ({
    date: "2026-01-01",
    mealType: "breakfast",
    budgetAmount: 0,
    carriedOverAmount: 0,
    isRecorded: false,
    ...overrides,
  });

  it("날짜 다음 끼니 순서(아침→점심→저녁) 기준으로 가장 이른 미기록 슬롯을 찾는다", () => {
    const slots = [
      slot({ date: "2026-01-02", mealType: "breakfast", isRecorded: true }),
      slot({ date: "2026-01-01", mealType: "dinner", isRecorded: false }),
      slot({ date: "2026-01-01", mealType: "lunch", isRecorded: false }),
    ];

    expect(findNextUnrecordedMealSlot(slots)).toEqual(
      expect.objectContaining({ date: "2026-01-01", mealType: "lunch" }),
    );
  });

  it("모든 슬롯이 기록됐으면 undefined를 반환한다", () => {
    const slots = [slot({ isRecorded: true })];

    expect(findNextUnrecordedMealSlot(slots)).toBeUndefined();
  });
});

describe("getRecommendBudgetAmount", () => {
  it("budget_amount와 carried_over_amount를 더한다", () => {
    expect(
      getRecommendBudgetAmount({
        date: "2026-01-01",
        mealType: "lunch",
        budgetAmount: 3000,
        carriedOverAmount: 1500,
        isRecorded: false,
      }),
    ).toBe(4500);
  });
});

describe("getTripDates", () => {
  it("당일치기면 날짜 하나만 반환한다", () => {
    expect(getTripDates({ startDate: "2026-01-01", endDate: "2026-01-01" })).toEqual(["2026-01-01"]);
  });

  it("월 경계를 넘는 기간도 하루 단위로 전부 반환한다", () => {
    expect(getTripDates({ startDate: "2026-01-30", endDate: "2026-02-02" })).toEqual([
      "2026-01-30",
      "2026-01-31",
      "2026-02-01",
      "2026-02-02",
    ]);
  });
});
