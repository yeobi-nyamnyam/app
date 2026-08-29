import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Redirect, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  DayCard,
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
import { ActiveTripDocument, UpdateMealSlotWeightDocument } from "@repo/types";

import { formatWon } from "@/lib/format";
import {
  MEAL_TYPES,
  MEAL_TYPE_LABEL,
  WEIGHT_LABEL,
  WEIGHT_LEVEL_BY_LABEL,
  computeMealBudgets,
  getTripDates,
  type MealType,
  type WeightLevel,
} from "@/lib/budget";
import { useSession } from "@/hooks/useSession";

interface ActiveTrip {
  name: string;
  startDate: string;
  endDate: string;
}

interface ActiveMealSlot {
  id: string;
  date: string;
  mealType: MealType;
  weightLevel: WeightLevel;
  budgetAmount: number;
  isRecorded: boolean;
  recordedAmount: number | null;
}

const todayDate = () => new Date().toISOString().slice(0, 10);

const handleNavChange = (key: NavBarItemKey) => {
  if (key === "home") return;
  if (key === "record") {
    router.push("/record");
    return;
  }
  if (key === "profile") {
    router.push("/mypage");
    return;
  }
  Alert.alert("준비 중", "아직 구현되지 않은 탭이에요.");
};

export default function HomeScreen() {
  const { session } = useSession();
  const { data, loading, refetch } = useQuery(ActiveTripDocument, {
    variables: { userId: session?.user.id ?? "" },
    skip: !session,
    fetchPolicy: "cache-and-network",
  });

  if (loading && !data) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContent}>
          <Text color="subtlest">여행 정보 불러오는 중...</Text>
        </View>
        <NavBar active="home" onChange={handleNavChange} />
      </View>
    );
  }

  const tripNode = data?.tripsCollection.edges[0]?.node;
  if (!tripNode) {
    return <EmptyHome />;
  }
  // F7(여행 자동 완료) 판정 로직 자체는 수진 담당이라 손대지 않고, trips.status
  // 필드만 읽어서 완료 화면으로 보낸다.
  if (tripNode.status === "completed") {
    return <Redirect href="/trip-complete" />;
  }

  const trip: ActiveTrip = {
    name: tripNode.name,
    startDate: tripNode.start_date,
    endDate: tripNode.end_date,
  };
  const mealSlots: ActiveMealSlot[] = (tripNode.meal_slotsCollection?.edges ?? []).map((edge) => ({
    id: edge.node.id,
    date: edge.node.date,
    mealType: edge.node.meal_type as MealType,
    weightLevel: edge.node.weight_level as WeightLevel,
    budgetAmount: edge.node.budget_amount,
    isRecorded: edge.node.is_recorded,
    recordedAmount: edge.node.recorded_amount,
  }));

  // schema-design.md §2: trips.status는 시작 전/진행 중을 구분하지 않으므로
  // (둘 다 'ongoing'), "예정" 표시는 클라이언트에서 start_date > 오늘로 계산한다.
  if (trip.startDate > todayDate()) {
    return <UpcomingTripHome trip={trip} mealSlots={mealSlots} />;
  }

  return <ActiveTripHome trip={trip} mealSlots={mealSlots} onChanged={() => refetch()} />;
}

function EmptyHome() {
  return (
    <View style={styles.container}>
      <View style={styles.emptyContent}>
        <EmptyTripPrompt
          onCreateTrip={() => router.push("/trip-create")}
          onLoadPastTrip={() =>
            Alert.alert("준비 중", "과거 여행 불러오기는 아직 준비 중이에요.")
          }
        />
      </View>
      <NavBar active="home" onChange={handleNavChange} />
    </View>
  );
}

function UpcomingTripHome({
  trip,
  mealSlots,
}: {
  trip: ActiveTrip;
  mealSlots: ActiveMealSlot[];
}) {
  const insets = useSafeAreaInsets();
  const daysUntilStart = Math.round(
    (new Date(trip.startDate).getTime() - new Date(todayDate()).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const firstDaySlots = mealSlots
    .filter((slot) => slot.date === trip.startDate)
    .sort((a, b) => MEAL_TYPES.indexOf(a.mealType) - MEAL_TYPES.indexOf(b.mealType));
  const firstDayBudget = firstDaySlots.reduce((sum, slot) => sum + slot.budgetAmount, 0);
  const budgetFor = (mealType: MealType) =>
    firstDaySlots.find((slot) => slot.mealType === mealType)?.budgetAmount ?? 0;
  const [, month, day] = trip.startDate.split("-");

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.dashboardContent,
          { paddingTop: spacing[16] + insets.top },
        ]}
      >
        <HeaderCard
          title={trip.name}
          consumedLabel="여행 시작까지"
          consumed={daysUntilStart > 0 ? `D-${daysUntilStart}` : "D-day"}
          budgetLabel="시작일"
          dayBudget={`${month}.${day}`}
        />
        <Text variant="title3Emphasized">1일차 예산 미리보기</Text>
        <DayCard
          day={`1일차 / ${month}.${day}`}
          totalBudget={formatWon(firstDayBudget)}
          breakfast={formatWon(budgetFor("breakfast"))}
          lunch={formatWon(budgetFor("lunch"))}
          dinner={formatWon(budgetFor("dinner"))}
        />
      </ScrollView>
      <NavBar active="home" onChange={handleNavChange} />
    </View>
  );
}

function ActiveTripHome({
  trip,
  mealSlots,
  onChanged,
}: {
  trip: ActiveTrip;
  mealSlots: ActiveMealSlot[];
  onChanged: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(true);
  const [updateMealSlotWeight] = useMutation(UpdateMealSlotWeightDocument);

  const today = todayDate();
  const dayIndex = getTripDates(trip).indexOf(today);
  const todaySlots = useMemo(
    () =>
      mealSlots
        .filter((slot) => slot.date === today)
        // GraphQL 쿼리는 끼니 순서를 보장하지 않아 아침/점심/저녁 순으로 직접 정렬
        .sort((a, b) => MEAL_TYPES.indexOf(a.mealType) - MEAL_TYPES.indexOf(b.mealType)),
    [mealSlots, today],
  );

  const dayBudget = todaySlots.reduce((sum, slot) => sum + slot.budgetAmount, 0);
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

  const [, month, day] = today.split("-");

  const handleMealPress = (mealType: MealType) => {
    Alert.alert(
      `${MEAL_TYPE_LABEL[mealType]} 소비 기록`,
      "소비 기록 화면은 아직 준비 중이에요. 곧 여기서 바로 기록할 수 있게 연결될 예정입니다.",
    );
  };

  const handleChangeWeight = async (mealKey: string, weightLabel: string) => {
    const weightLevel =
      WEIGHT_LEVEL_BY_LABEL[weightLabel as keyof typeof WEIGHT_LEVEL_BY_LABEL];
    const nextWeights: Record<MealType, WeightLevel> = {
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

    const recalculated = computeMealBudgets(dayBudget, nextWeights);
    const targetSlots = MEAL_TYPES.map((mealType) =>
      todaySlots.find((slot) => slot.mealType === mealType),
    ).filter((slot): slot is ActiveMealSlot => slot != null);

    try {
      await updateMealSlotWeight({
        variables: {
          slotIds: targetSlots.map((slot) => slot.id),
          budgetAmounts: targetSlots.map((slot) => recalculated[slot.mealType]),
          weightLevels: targetSlots.map((slot) => nextWeights[slot.mealType]),
        },
      });
      onChanged();
    } catch (error) {
      Alert.alert(
        "가중치 변경 실패",
        error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.dashboardContent,
          { paddingTop: spacing[16] + insets.top },
        ]}
      >
        <Pressable onPress={() => router.push("/budget-edit")}>
          <HeaderCard
            title={`${trip.name} | ${dayIndex + 1}일차`}
            consumed={formatWon(consumed)}
            dayBudget={formatWon(dayBudget)}
            extraBudget={extraBudget}
            state={headerState}
          />
        </Pressable>
        <DayWeightSelector
          title={`${dayIndex + 1}일차 | ${month}.${day}`}
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
