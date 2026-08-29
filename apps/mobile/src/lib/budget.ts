import type { MealWeight } from "@repo/ui";

// F1~F4 예산 계산 순수 유틸. docs/business-logic-notes.md의 배분/재분배 규칙을 그대로 구현한다.

export type MealType = "breakfast" | "lunch" | "dinner";
export type WeightLevel = "light" | "normal" | "hearty";

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

export const MEAL_TYPE_LABEL: Record<MealType, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
};

// business-logic-notes.md §1 근처의 "weight_level은 프리셋만 저장, 실제 배율은 코드 상수" 규칙
export const WEIGHT_MULTIPLIER: Record<WeightLevel, number> = {
  light: 0.8,
  normal: 1.0,
  hearty: 1.2,
};

export const WEIGHT_LABEL: Record<WeightLevel, MealWeight> = {
  light: "가볍게",
  normal: "보통",
  hearty: "든든하게",
};

export const WEIGHT_LEVEL_BY_LABEL: Record<MealWeight, WeightLevel> = {
  가볍게: "light",
  보통: "normal",
  든든하게: "hearty",
};

export const DEFAULT_MEAL_WEIGHTS: Record<MealType, WeightLevel> = {
  breakfast: "light",
  lunch: "normal",
  dinner: "hearty",
};

/**
 * @param dailyBudget 하루 식비 배분액(원)
 * @param weights 끼니별 가중치 프리셋
 */
export const computeMealBudgets = (
  dailyBudget: number,
  weights: Record<MealType, WeightLevel>,
): Record<MealType, number> => {
  const totalWeight = MEAL_TYPES.reduce(
    (sum, meal) => sum + WEIGHT_MULTIPLIER[weights[meal]],
    0,
  );
  const rounded: Record<MealType, number> = {
    breakfast: Math.floor(
      (dailyBudget * WEIGHT_MULTIPLIER[weights.breakfast]) / totalWeight,
    ),
    lunch: Math.floor(
      (dailyBudget * WEIGHT_MULTIPLIER[weights.lunch]) / totalWeight,
    ),
    dinner: Math.floor(
      (dailyBudget * WEIGHT_MULTIPLIER[weights.dinner]) / totalWeight,
    ),
  };
  const remainder =
    dailyBudget - (rounded.breakfast + rounded.lunch + rounded.dinner);
  return { ...rounded, dinner: rounded.dinner + remainder };
};

/**
 * @param floatingBudget 여행 전체 식비 예산(원)
 * @param totalDays 여행 총 일수
 */
export const computeDayBudgets = (
  floatingBudget: number,
  totalDays: number,
): number[] => {
  const base = Math.floor(floatingBudget / totalDays);
  const remainder = floatingBudget - base * totalDays;
  return Array.from({ length: totalDays }, (_, index) =>
    index === totalDays - 1 ? base + remainder : base,
  );
};

export interface RedistributableSlot {
  id: string;
  isRecorded: boolean;
  budgetAmount: number;
  weightLevel: WeightLevel;
}

/**
 * F2-3 남은 끼니 기준 재분배 (business-logic-notes.md §2).
 * is_recorded=true 슬롯은 소급 변경하지 않고, 새 floatingBudget에서 그 슬롯들의
 * budget_amount 합을 뺀 나머지를 남은(is_recorded=false) 슬롯들의 weight_level
 * 비율로 재배분한다. 계산에 필요한 최소 필드(RedistributableSlot)만 요구하는
 * 제네릭이라 실제 GraphQL 응답 슬롯 타입 그대로 재사용할 수 있다.
 *
 * @param mealSlots 여행의 전체 끼니 슬롯
 * @param nextFloatingBudget 새로 저장된 유동비용(식비 예산)
 */
export const redistributeUnrecordedSlots = <T extends RedistributableSlot>(
  mealSlots: T[],
  nextFloatingBudget: number,
): T[] => {
  const recordedTotal = mealSlots
    .filter((slot) => slot.isRecorded)
    .reduce((sum, slot) => sum + slot.budgetAmount, 0);
  const remainingPool = Math.max(nextFloatingBudget - recordedTotal, 0);

  const unrecorded = mealSlots.filter((slot) => !slot.isRecorded);
  const totalWeight = unrecorded.reduce(
    (sum, slot) => sum + WEIGHT_MULTIPLIER[slot.weightLevel],
    0,
  );

  let allocated = 0;
  const amountBySlotId = new Map<string, number>();
  unrecorded.forEach((slot, index) => {
    const isLast = index === unrecorded.length - 1;
    const amount = isLast
      ? remainingPool - allocated
      : totalWeight > 0
        ? Math.floor(
            (remainingPool * WEIGHT_MULTIPLIER[slot.weightLevel]) / totalWeight,
          )
        : 0;
    allocated += amount;
    amountBySlotId.set(slot.id, amount);
  });

  return mealSlots.map((slot) =>
    slot.isRecorded
      ? slot
      : { ...slot, budgetAmount: amountBySlotId.get(slot.id) ?? 0 },
  );
};

export const getTripDates = (trip: { startDate: string; endDate: string }): string[] => {
  const dates: string[] = [];
  const cursor = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};
