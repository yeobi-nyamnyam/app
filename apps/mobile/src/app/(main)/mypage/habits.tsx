import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@apollo/client/react";
import {
  BudgetRatioRow,
  CategoryBreakdownRow,
  DropdownField,
  Header,
  MealTimeBarChart,
  NavBar,
  Text,
  colors,
  radius,
  spacing,
  stroke,
  type DropdownOption,
  type MealTimeBarItem,
  type NavBarItemKey,
  type SummaryStat,
  SummaryStatsCard,
} from "@repo/ui";
import { SpendingHabitsDocument } from "@repo/types";

import { useSession } from "@/hooks/useSession";
import { formatWon } from "@/lib/format";
import type { MealLogCategory } from "@/components/RecordForm";
import type { MealType } from "@/lib/budget";
import {
  CATEGORY_COLORS,
  buildCategoryBreakdown,
  buildMealTimeAverages,
  buildRecordFooterCounts,
  buildTripOptions,
  buildTripRatios,
  filterMealLogsByScope,
  type MealLogInput,
  type TripInput,
} from "@/lib/spendingHabits";

// 소비 습관 대시보드 (M1, Figma node 408:2212). 종료된(status='completed') 여행만
// 조회 대상 — 진행 중인 여행은 제외한다. "여행별 예산 대비 소비율" 카드는 각
// 여행의 소비율을 보여주기만 하는 정보성 리스트이고(탭/선택 기능 없음), 아래
// 요약카드/카테고리/끼니차트를 어느 여행 기준으로 볼지는 기록 화면의 방문 날짜/
// 끼니 때 선택과 동일한 DropdownField로 고른다.
export default function HabitsScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const { data, loading } = useQuery(SpendingHabitsDocument, {
    variables: { userId: session?.user.id ?? "" },
    skip: !session,
    fetchPolicy: "cache-and-network",
  });

  const trips: TripInput[] = useMemo(
    () =>
      (data?.tripsCollection.edges ?? [])
        .filter((edge) => edge.node.status === "completed")
        .map((edge) => ({
          id: edge.node.id,
          name: edge.node.name,
          status: edge.node.status,
          startDate: edge.node.start_date,
          endDate: edge.node.end_date,
          totalBudget: edge.node.total_budget,
        })),
    [data],
  );

  const mealLogs: MealLogInput[] = useMemo(
    () =>
      (data?.tripsCollection.edges ?? [])
        .filter((edge) => edge.node.status === "completed")
        .flatMap((tripEdge) =>
          (tripEdge.node.meal_logsCollection?.edges ?? []).map((logEdge) => ({
            tripId: tripEdge.node.id,
            amount: logEdge.node.amount,
            category: logEdge.node.category as MealLogCategory,
            hasReceipt: Boolean(logEdge.node.receipt_image_url),
            mealType: (logEdge.node.meal_slots?.meal_type as MealType | undefined) ?? null,
          })),
        ),
    [data],
  );

  const tripRatios = useMemo(() => buildTripRatios(trips, mealLogs), [trips, mealLogs]);
  const tripOptions = useMemo(() => buildTripOptions(trips), [trips]);
  const dropdownOptions: DropdownOption[] = useMemo(
    () => tripOptions.map((option) => ({ value: option.id, label: `${option.label} · ${option.endDateLabel}` })),
    [tripOptions],
  );
  const effectiveTripId = selectedTripId ?? tripOptions[0]?.id ?? "";
  const selected = tripRatios.find((trip) => trip.id === effectiveTripId);
  const scopedLogs = useMemo(
    () => filterMealLogsByScope(mealLogs, effectiveTripId),
    [mealLogs, effectiveTripId],
  );
  const categoryBreakdown = useMemo(() => buildCategoryBreakdown(scopedLogs), [scopedLogs]);
  const mealTimeAverages = useMemo(() => buildMealTimeAverages(scopedLogs), [scopedLogs]);
  const footerCounts = useMemo(() => buildRecordFooterCounts(scopedLogs), [scopedLogs]);

  const remaining = (selected?.budget ?? 0) - (selected?.spent ?? 0);
  const summaryStats: [SummaryStat, SummaryStat, SummaryStat] = [
    { value: formatWon(selected?.spent ?? 0), label: "총 지출" },
    { value: `${selected?.ratio ?? 0}%`, label: "예산 대비" },
    { value: formatWon(remaining), label: "남은 예산", tone: remaining < 0 ? "error" : "default" },
  ];

  const mealTimeItems: [MealTimeBarItem, MealTimeBarItem, MealTimeBarItem] = [
    { label: mealTimeAverages[0]!.label, value: mealTimeAverages[0]!.average, valueLabel: String(mealTimeAverages[0]!.average) },
    { label: mealTimeAverages[1]!.label, value: mealTimeAverages[1]!.average, valueLabel: String(mealTimeAverages[1]!.average) },
    { label: mealTimeAverages[2]!.label, value: mealTimeAverages[2]!.average, valueLabel: String(mealTimeAverages[2]!.average) },
  ];

  const handleNavChange = (key: NavBarItemKey) => {
    if (key === "profile") {
      router.push("/mypage");
      return;
    }
    if (key === "home") {
      router.push("/");
      return;
    }
    if (key === "recommend") {
      router.push("/recommend");
      return;
    }
    if (key === "chat") {
      router.push("/chat");
      return;
    }
    if (key === "record") {
      router.push("/record");
      return;
    }
    Alert.alert("준비 중", "아직 구현되지 않은 탭이에요.");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="소비 습관" onBackPress={() => router.back()} />
      {loading && !data ? (
        <View style={styles.loadingContent}>
          <Text color="subtlest">소비 습관을 불러오는 중...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text variant="footnoteEmphasized">여행별 예산 대비 소비율 (100%=예산)</Text>
            <View style={styles.ratioList}>
              {tripRatios.map((trip) => (
                <BudgetRatioRow key={trip.id} label={trip.label} ratio={trip.ratio} />
              ))}
            </View>
          </View>

          <DropdownField
            placeholder="여행을 선택하세요"
            options={dropdownOptions}
            value={effectiveTripId}
            onChange={setSelectedTripId}
            hideSelectedInMenu
            disabled={tripOptions.length <= 1}
          />

          <SummaryStatsCard stats={summaryStats} />

          <Text variant="subheadlineEmphasized">카테고리별 지출 비중</Text>
          {categoryBreakdown.length > 0 ? (
            <View style={styles.card}>
              {categoryBreakdown.map((item) => (
                <CategoryBreakdownRow
                  key={item.category}
                  label={item.category}
                  amount={formatWon(item.amount)}
                  percent={item.percent}
                  dotColor={CATEGORY_COLORS[item.category]}
                />
              ))}
            </View>
          ) : (
            <View style={styles.card}>
              <Text variant="footnoteRegular" color="subtle" align="center">
                아직 지출 기록이 없어요.
              </Text>
            </View>
          )}

          <Text variant="subheadlineEmphasized">끼니 시간대별 평균</Text>
          <View style={styles.card}>
            <MealTimeBarChart items={mealTimeItems} />
          </View>

          <Text variant="footnoteRegular" color="subtle">
            {`분석 근거 · 기록 ${footerCounts.recordCount}건 · 영수증 ${footerCounts.receiptCount}건`}
          </Text>
        </ScrollView>
      )}
      <View style={{ paddingBottom: insets.bottom }}>
        <NavBar active="profile" onChange={handleNavChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  loadingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    gap: spacing[16],
    padding: spacing[16],
    paddingTop: spacing[12],
  },
  card: {
    width: "100%",
    gap: spacing[10],
    padding: spacing[16],
    borderWidth: stroke.hairline,
    borderColor: colors.border.neutral.subtle,
    borderRadius: radius[16],
    backgroundColor: colors.surface.neutral.default,
  },
  ratioList: {
    gap: spacing[2],
  },
});
