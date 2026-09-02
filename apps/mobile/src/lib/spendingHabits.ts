import type { MealLogCategory } from "@/components/RecordForm";
import { MEAL_TYPES, MEAL_TYPE_LABEL, type MealType } from "@/lib/budget";

// CHECK(식비/교통/숙박/기념품/기타) 순서 그대로 — 카테고리별 지출 비중 카드에서
// 금액 있는 항목만 걸러 금액 내림차순으로 다시 정렬해 보여준다(표시 순서는
// buildCategoryBreakdown이 정함, 이 배열은 색상 매핑용 고정 순서).
const CATEGORY_ORDER: MealLogCategory[] = ["식비", "교통", "숙박", "기념품", "기타"];

// Figma "소비 습관" 화면(node 408:2212)의 카테고리 점 색상. 식비는 앱 기본 primary
// 토큰(#8dd7fb, 디자인 #85d0ff에 가장 가까운 기존 토큰)을 쓰고, 나머지 4개는
// Figma가 실제로 쓴 "Color Primitive/Light Accent" 팔레트 원본 hex를 그대로 옮김
// (packages/tokens에 아직 named export가 없어 여기 직접 상수로 둠). 숙박은 목업에
// 예시 금액이 0원이라 실제로 쓰인 색이 없어, 남은 팔레트 중 사용자 확인을 거쳐
// Slate(#7d99aa)로 정함.
export const CATEGORY_COLORS: Record<MealLogCategory, string> = {
  식비: "#8dd7fb",
  교통: "#ffc067",
  숙박: "#7d99aa",
  기념품: "#ff708f",
  기타: "#66c4ff",
};

export interface TripInput {
  id: string;
  name: string;
  status: string;
  startDate: string;
  totalBudget: number;
}

export interface MealLogInput {
  tripId: string;
  amount: number;
  category: MealLogCategory;
  hasReceipt: boolean;
  mealType: MealType | null;
}

export interface TripRatio {
  id: string;
  label: string;
  spent: number;
  budget: number;
  ratio: number;
}

const sum = (values: number[]): number => values.reduce((total, value) => total + value, 0);

const ratioOf = (spent: number, budget: number): number =>
  budget > 0 ? Math.round((spent / budget) * 100) : 0;

// "전체" 행을 맨 앞에 두고, 나머지는 여행 시작일 최신순으로 정렬한다.
export const buildTripRatios = (trips: TripInput[], mealLogs: MealLogInput[]): TripRatio[] => {
  const perTrip = [...trips]
    .sort((a, b) => (a.startDate < b.startDate ? 1 : a.startDate > b.startDate ? -1 : 0))
    .map((trip) => {
      const spent = sum(mealLogs.filter((log) => log.tripId === trip.id).map((log) => log.amount));
      const label = trip.status === "ongoing" ? `${trip.name} (진행)` : trip.name;
      return { id: trip.id, label, spent, budget: trip.totalBudget, ratio: ratioOf(spent, trip.totalBudget) };
    });

  const totalSpent = sum(perTrip.map((trip) => trip.spent));
  const totalBudget = sum(perTrip.map((trip) => trip.budget));
  const all: TripRatio = {
    id: "all",
    label: "전체",
    spent: totalSpent,
    budget: totalBudget,
    ratio: ratioOf(totalSpent, totalBudget),
  };

  return [all, ...perTrip];
};

export const filterMealLogsByScope = (mealLogs: MealLogInput[], scopeTripId: string): MealLogInput[] =>
  scopeTripId === "all" ? mealLogs : mealLogs.filter((log) => log.tripId === scopeTripId);

export interface CategoryBreakdownItem {
  category: MealLogCategory;
  amount: number;
  percent: number;
}

// 금액이 있는 카테고리만, 금액 내림차순으로 반환한다.
export const buildCategoryBreakdown = (mealLogs: MealLogInput[]): CategoryBreakdownItem[] => {
  const totalsByCategory = new Map<MealLogCategory, number>();
  for (const log of mealLogs) {
    totalsByCategory.set(log.category, (totalsByCategory.get(log.category) ?? 0) + log.amount);
  }
  const totalAmount = sum([...totalsByCategory.values()]);

  return CATEGORY_ORDER.map((category) => ({ category, amount: totalsByCategory.get(category) ?? 0 }))
    .filter((item) => item.amount > 0)
    .map((item) => ({ ...item, percent: ratioOf(item.amount, totalAmount) }))
    .sort((a, b) => b.amount - a.amount);
};

export interface MealTimeAverageItem {
  mealType: MealType;
  label: string;
  average: number;
}

// 끼니 슬롯(meal_slot_id)이 연결된 기록만 대상으로, 끼니 시간대별 "평균" 지출
// (해당 시간대 기록 1건당 평균 금액)을 계산한다. 기타소비(meal_slot_id null)는 제외.
export const buildMealTimeAverages = (mealLogs: MealLogInput[]): MealTimeAverageItem[] =>
  MEAL_TYPES.map((mealType) => {
    const matched = mealLogs.filter((log) => log.mealType === mealType);
    const average = matched.length > 0 ? Math.round(sum(matched.map((log) => log.amount)) / matched.length) : 0;
    return { mealType, label: MEAL_TYPE_LABEL[mealType], average };
  });

export interface RecordFooterCounts {
  recordCount: number;
  receiptCount: number;
}

export const buildRecordFooterCounts = (mealLogs: MealLogInput[]): RecordFooterCounts => ({
  recordCount: mealLogs.length,
  receiptCount: mealLogs.filter((log) => log.hasReceipt).length,
});
