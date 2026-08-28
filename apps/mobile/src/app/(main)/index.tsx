import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Redirect, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DayWeightSelector,
  EmptyTripPrompt,
  HeaderCard,
  MealCard,
  NavBar,
  Text,
  colors,
  spacing,
  type NavBarItemKey,
} from "@repo/ui";

import { formatWon } from "@/lib/format";
import {
  MEAL_TYPES,
  MEAL_TYPE_LABEL,
  MOCK_TODAY,
  WEIGHT_LABEL,
  WEIGHT_LEVEL_BY_LABEL,
  getTripDates,
  type MealType,
} from "@/lib/mock/trip";
import { useTripStore } from "@/lib/mock/tripStore";

// 로그인/여행 목록 API 연동 전까지는 데모용 여행이 항상 진행 중인 것으로 가정
const HAS_ACTIVE_TRIP = true;

const handleNavChange = (key: NavBarItemKey) => {
  if (key === "home") return;
  if (key === "record") {
    router.push("/record");
    return;
  }
  Alert.alert("준비 중", "아직 구현되지 않은 탭이에요.");
};

export default function HomeScreen() {
  const { trip } = useTripStore();

  if (!HAS_ACTIVE_TRIP) {
    return <EmptyHome />;
  }
  // F7(여행 자동 완료) 판정은 서버/RPC 몫이지만, 목데이터 단계에서는 오늘이
  // 여행 종료일을 지났는지로만 임시 판별해서 완료 화면으로 보낸다.
  if (MOCK_TODAY > trip.endDate) {
    return <Redirect href="/trip-complete" />;
  }
  return <ActiveTripHome />;
}

function EmptyHome() {
  return (
    <View style={styles.container}>
      <View style={styles.emptyContent}>
        <EmptyTripPrompt
          onCreateTrip={() => router.push("/trip-new")}
          onLoadPastTrip={() =>
            Alert.alert("준비 중", "과거 여행 불러오기는 아직 준비 중이에요.")
          }
        />
      </View>
      <NavBar active="home" onChange={handleNavChange} />
    </View>
  );
}

function ActiveTripHome() {
  const insets = useSafeAreaInsets();
  const { trip, mealSlots, updateDayWeights } = useTripStore();
  const [expanded, setExpanded] = useState(true);

  const dayIndex = getTripDates(trip).indexOf(MOCK_TODAY);
  const todaySlots = useMemo(
    () => mealSlots.filter((slot) => slot.date === MOCK_TODAY),
    [mealSlots],
  );

  const dayBudget = todaySlots.reduce(
    (sum, slot) => sum + slot.budgetAmount,
    0,
  );
  const consumed = todaySlots.reduce(
    (sum, slot) => sum + (slot.recordedAmount ?? 0),
    0,
  );
  const allRecorded =
    todaySlots.length === MEAL_TYPES.length &&
    todaySlots.every((slot) => slot.isRecorded);
  const anyRecorded = todaySlots.some((slot) => slot.isRecorded);
  const firstUnrecordedIndex = todaySlots.findIndex((slot) => !slot.isRecorded);

  const headerState = allRecorded
    ? consumed <= dayBudget
      ? "plus"
      : "minus"
    : "default";
  const extraBudget = allRecorded
    ? formatWon(Math.abs(dayBudget - consumed))
    : undefined;

  const [, month, day] = MOCK_TODAY.split("-");

  const handleMealPress = (mealType: MealType) => {
    Alert.alert(
      `${MEAL_TYPE_LABEL[mealType]} 소비 기록`,
      "소비 기록 화면은 아직 준비 중이에요. 곧 여기서 바로 기록할 수 있게 연결될 예정입니다.",
    );
  };

  const handleChangeWeight = (mealKey: string, weightLabel: string) => {
    const weightLevel =
      WEIGHT_LEVEL_BY_LABEL[weightLabel as keyof typeof WEIGHT_LEVEL_BY_LABEL];
    const nextWeights: Record<MealType, typeof weightLevel> = {
      breakfast:
        todaySlots.find((slot) => slot.mealType === "breakfast")?.weightLevel ??
        "light",
      lunch:
        todaySlots.find((slot) => slot.mealType === "lunch")?.weightLevel ??
        "normal",
      dinner:
        todaySlots.find((slot) => slot.mealType === "dinner")?.weightLevel ??
        "hearty",
    };
    nextWeights[mealKey as MealType] = weightLevel;
    updateDayWeights(MOCK_TODAY, nextWeights);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.dashboardContent,
          { paddingTop: spacing[16] + insets.top },
        ]}
      >
        <Pressable onPress={() => router.push("/trip-edit")}>
          <HeaderCard
            title={`${trip.name} | ${dayIndex + 1}일차`}
            consumed={formatWon(consumed)}
            dayBudget={formatWon(dayBudget)}
            extraBudget={extraBudget}
            state={headerState}
          />
        </Pressable>
        <DayWeightSelector
          title={`${dayIndex + 1}일차 · ${month}.${day}`}
          dayBudget={formatWon(dayBudget)}
          expanded={expanded}
          active={!anyRecorded}
          onToggleExpanded={() => setExpanded((prev) => !prev)}
          onChangeWeight={handleChangeWeight}
          meals={todaySlots.map((slot) => ({
            key: slot.mealType,
            label: MEAL_TYPE_LABEL[slot.mealType],
            amount: formatWon(slot.budgetAmount),
            weight: WEIGHT_LABEL[slot.weightLevel],
          }))}
        />
        <View style={styles.mealSection}>
          <Text variant="title3Emphasized">오늘의 끼니</Text>
          {todaySlots.map((slot, index) => (
            <Pressable
              key={slot.id}
              onPress={() => handleMealPress(slot.mealType)}
            >
              <MealCard
                meal={MEAL_TYPE_LABEL[slot.mealType]}
                budget={formatWon(
                  slot.isRecorded
                    ? (slot.recordedAmount ?? 0)
                    : slot.budgetAmount,
                )}
                state={
                  slot.isRecorded
                    ? "done"
                    : index === firstUnrecordedIndex
                      ? "active"
                      : "pending"
                }
                showExcess={
                  slot.isRecorded &&
                  (slot.recordedAmount ?? 0) > slot.budgetAmount
                }
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <NavBar active="home" onChange={handleNavChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  emptyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[16],
  },
  dashboardContent: {
    paddingHorizontal: spacing[16],
    paddingBottom: spacing[24],
    gap: spacing[16],
  },
  mealSection: {
    gap: spacing[12],
  },
});
