import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  computeMealBudgets,
  mockMealSlots,
  mockTrip,
  redistributeUnrecordedSlots,
  type MealType,
  type MockMealSlot,
  type MockTrip,
  type WeightLevel,
} from "./trip";

export interface BudgetEditInput {
  name: string;
  totalBudget: number;
  fixedCost: number;
  floatingBudget: number;
}

interface TripStoreValue {
  trip: MockTrip;
  mealSlots: MockMealSlot[];
  updateDayWeights: (
    date: string,
    weights: Record<MealType, WeightLevel>,
  ) => void;
  applyBudgetEdit: (next: BudgetEditInput) => void;
}

const TripStoreContext = createContext<TripStoreValue | null>(null);

/**
 * @param children 이 스토어를 사용할 하위 화면들 (F1~F4 사이에서 여행/끼니 목데이터를 공유)
 */
export const TripStoreProvider = ({ children }: { children: ReactNode }) => {
  const [trip, setTrip] = useState<MockTrip>(mockTrip);
  const [mealSlots, setMealSlots] = useState<MockMealSlot[]>(mockMealSlots);

  const updateDayWeights: TripStoreValue["updateDayWeights"] = (
    date,
    weights,
  ) => {
    setMealSlots((prev) => {
      const daySlots = prev.filter((slot) => slot.date === date);
      const dayBudget = daySlots.reduce(
        (sum, slot) => sum + slot.budgetAmount,
        0,
      );
      const recalculated = computeMealBudgets(dayBudget, weights);
      return prev.map((slot) =>
        slot.date === date
          ? {
              ...slot,
              weightLevel: weights[slot.mealType],
              budgetAmount: recalculated[slot.mealType],
            }
          : slot,
      );
    });
  };

  const applyBudgetEdit: TripStoreValue["applyBudgetEdit"] = (next) => {
    setTrip((prev) => ({ ...prev, ...next }));
    setMealSlots((prev) =>
      redistributeUnrecordedSlots(prev, next.floatingBudget),
    );
  };

  const value = useMemo(
    () => ({ trip, mealSlots, updateDayWeights, applyBudgetEdit }),
    [trip, mealSlots],
  );

  return (
    <TripStoreContext.Provider value={value}>
      {children}
    </TripStoreContext.Provider>
  );
};

export const useTripStore = (): TripStoreValue => {
  const context = useContext(TripStoreContext);
  if (!context) {
    throw new Error(
      "useTripStore는 TripStoreProvider 내부에서만 사용할 수 있습니다",
    );
  }
  return context;
};
