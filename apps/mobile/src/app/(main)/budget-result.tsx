import { ScrollView, StyleSheet, Text as RNText, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DayCard, Footer, Header, Text, colors, getFontFamily, radius, spacing, typography } from "@repo/ui";

import { formatWon } from "@/lib/format";
import {
  computeDayBudgets,
  computeMealBudgets,
  getTripDates,
  type MealType,
  type WeightLevel,
} from "@/lib/mock/trip";

const toWeightLevel = (value: string | string[] | undefined, fallback: WeightLevel): WeightLevel => {
  return value === "light" || value === "normal" || value === "hearty" ? value : fallback;
};

export default function BudgetResultScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    startDate: string;
    endDate: string;
    totalBudget: string;
    fixedCost: string;
    ratio: string;
    floatingBudget: string;
    breakfastWeight: string;
    lunchWeight: string;
    dinnerWeight: string;
  }>();

  const totalBudget = Number(params.totalBudget) || 0;
  const fixedCost = Number(params.fixedCost) || 0;
  const ratio = Number(params.ratio) || 0;
  const floatingBudget = Number(params.floatingBudget) || 0;

  const weights: Record<MealType, WeightLevel> = {
    breakfast: toWeightLevel(params.breakfastWeight, "light"),
    lunch: toWeightLevel(params.lunchWeight, "normal"),
    dinner: toWeightLevel(params.dinnerWeight, "hearty"),
  };

  const dates = params.startDate && params.endDate ? getTripDates({ startDate: params.startDate, endDate: params.endDate }) : [];
  const dayBudgets = computeDayBudgets(floatingBudget, Math.max(dates.length, 1));

  return (
    <View style={styles.container}>
      <Header title="예산 산정 결과" onBackPress={() => router.back()} topInset={insets.top} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <RNText style={styles.summaryLabel}>전체 식비 예산</RNText>
          <Text variant="title1Bold">{formatWon(floatingBudget)}</Text>
          <Text variant="subheadlineRegular">
            ({formatWon(totalBudget)} - 고정비용 {formatWon(fixedCost)}) × 식비 비율 {ratio}%
          </Text>
        </View>

        <Text variant="title3Emphasized">일별 · 끼니별 배분</Text>
        <View style={styles.dayCards}>
          {dates.map((date, dayIndex) => {
            const dayBudget = dayBudgets[dayIndex] ?? 0;
            const mealBudgets = computeMealBudgets(dayBudget, weights);
            const [, month, day] = date.split("-");
            return (
              <DayCard
                key={date}
                day={`${dayIndex + 1}일차 / ${month}.${day}`}
                totalBudget={formatWon(dayBudget)}
                breakfast={formatWon(mealBudgets.breakfast)}
                lunch={formatWon(mealBudgets.lunch)}
                dinner={formatWon(mealBudgets.dinner)}
              />
            );
          })}
        </View>
      </ScrollView>
      <Footer label="홈으로 가기" onPress={() => router.replace("/")} bottomInset={insets.bottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  scrollContent: {
    paddingHorizontal: spacing[16],
    paddingTop: spacing[24],
    paddingBottom: spacing[24],
    gap: spacing[24],
  },
  summaryCard: {
    width: "100%",
    backgroundColor: colors.surface.primary.subtlest,
    borderRadius: radius[23],
    padding: spacing[20],
    gap: spacing[8],
  },
  dayCards: {
    gap: spacing[12],
  },
  summaryLabel: {
    fontFamily: getFontFamily(typography.headlineEmphasized.fontWeight),
    fontSize: typography.headlineEmphasized.fontSize,
    lineHeight: typography.headlineEmphasized.lineHeight,
    letterSpacing: typography.headlineEmphasized.letterSpacing,
    fontWeight: typography.headlineEmphasized.fontWeight,
    color: colors.content.primary.bold,
  },
});
