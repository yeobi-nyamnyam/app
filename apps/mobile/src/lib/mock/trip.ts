import type { MealWeight } from "@repo/ui";

// TourAPI/착한가격업소 연동 전까지 F1~F4 화면을 데모하기 위한 목데이터.
// 형태는 docs/schema-design.md의 trips/meal_slots 테이블을 그대로 따른다.

export type MealType = "breakfast" | "lunch" | "dinner";
export type WeightLevel = "light" | "normal" | "hearty";

export interface MockTrip {
  id: string;
  name: string;
  regionCode: string;
  regionName: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  fixedCost: number;
  foodBudgetRatio: number;
  floatingBudget: number;
  status: "ongoing" | "completed";
}

export interface MockMealSlot {
  id: string;
  tripId: string;
  date: string;
  mealType: MealType;
  weightLevel: WeightLevel;
  budgetAmount: number;
  carriedOverAmount: number;
  isRecorded: boolean;
  isCascadeConfirmed: boolean;
  recordedAmount: number | null;
}

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

/**
 * F2-3 남은 끼니 기준 재분배 (business-logic-notes.md §2).
 * is_recorded=true 슬롯은 소급 변경하지 않고, 새 floatingBudget에서 그 슬롯들의
 * budget_amount 합을 뺀 나머지를 남은(is_recorded=false) 슬롯들의 weight_level
 * 비율로 재배분한다.
 *
 * @param mealSlots 여행의 전체 끼니 슬롯
 * @param nextFloatingBudget 새로 저장된 유동비용(식비 예산)
 */
export const redistributeUnrecordedSlots = (
  mealSlots: MockMealSlot[],
  nextFloatingBudget: number,
): MockMealSlot[] => {
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

export const getTripDates = (
  trip: Pick<MockTrip, "startDate" | "endDate">,
): string[] => {
  const dates: string[] = [];
  const cursor = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

export const mockTrip: MockTrip = {
  id: "trip-1",
  name: "친구들과 대구 여행",
  regionCode: "daegu",
  regionName: "대구",
  startDate: "2026-08-12",
  endDate: "2026-08-14",
  totalBudget: 480000,
  fixedCost: 180000,
  foodBudgetRatio: 45,
  floatingBudget: 135000,
  status: "ongoing",
};

// 실제로는 로그인한 유저의 오늘 날짜와 trip.startDate로 계산되지만, 백엔드 연동 전이라 2일차로 고정
export const MOCK_TODAY = "2026-08-13";

const buildMealSlots = (trip: MockTrip): MockMealSlot[] => {
  const dates = getTripDates(trip);
  const dayBudgets = computeDayBudgets(trip.floatingBudget, dates.length);

  return dates.flatMap((date, dayIndex) => {
    const dayBudget = dayBudgets[dayIndex] ?? 0;
    const mealBudgets = computeMealBudgets(dayBudget, DEFAULT_MEAL_WEIGHTS);
    return MEAL_TYPES.map((mealType) => {
      const isPastBreakfastOnDay2 =
        date === "2026-08-13" && mealType === "breakfast";
      return {
        id: `${trip.id}-${date}-${mealType}`,
        tripId: trip.id,
        date,
        mealType,
        weightLevel: DEFAULT_MEAL_WEIGHTS[mealType],
        budgetAmount: mealBudgets[mealType],
        carriedOverAmount: 0,
        isRecorded: isPastBreakfastOnDay2,
        isCascadeConfirmed: false,
        recordedAmount: isPastBreakfastOnDay2 ? mealBudgets[mealType] : null,
      };
    });
  });
};

export const mockMealSlots: MockMealSlot[] = buildMealSlots(mockTrip);
