import { CreateTripWithMealSlotsDocument } from "@repo/types";

import { apolloClient } from "@/lib/apollo";

export interface CreateTripInput {
  name: string;
  regionCode: string;
  regionDisplayName: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  fixedCost: number;
  foodBudgetRatio: number;
  floatingBudget: number;
  dates: string[];
  mealTypes: string[];
  weightLevels: string[];
  budgetAmounts: number[];
}

export interface CreatedTrip {
  id: string;
  status: string;
}

// F1+F2: trips + meal_slots 생성을 하나의 Postgres 함수(create_trip_with_meal_slots)로
// 원자적으로 처리한다 (docs/business-logic-notes.md 결정사항 — RPC 방식).
export async function createTrip(input: CreateTripInput): Promise<CreatedTrip> {
  const { data } = await apolloClient.mutate({
    mutation: CreateTripWithMealSlotsDocument,
    variables: {
      name: input.name,
      regionCode: input.regionCode,
      regionDisplayName: input.regionDisplayName,
      startDate: input.startDate,
      endDate: input.endDate,
      totalBudget: input.totalBudget,
      fixedCost: input.fixedCost,
      // pg_graphql의 BigFloat 스칼라는 mutation 입력값을 문자열로만 받는다
      // ("Invalid input for BigFloat type. String required").
      foodBudgetRatio: String(input.foodBudgetRatio),
      floatingBudget: input.floatingBudget,
      dates: input.dates,
      mealTypes: input.mealTypes,
      weightLevels: input.weightLevels,
      budgetAmounts: input.budgetAmounts,
    },
  });
  const trip = data?.create_trip_with_meal_slots;
  if (!trip) {
    throw new Error("여행 생성에 실패했어요.");
  }
  return { id: trip.id, status: trip.status };
}
