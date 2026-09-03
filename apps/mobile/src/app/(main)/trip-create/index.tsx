import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChipList,
  FormField,
  Footer,
  Header,
  Notice,
  TextField,
  colors,
  spacing,
} from "@repo/ui";

import { DateRangeField } from "@/components/DateRangeField";
import { KrwIcon, PercentIcon } from "@/components/TripFieldIcons";
import { formatDigitsForDisplay, formatWon, parseDigits } from "@/lib/format";
import {
  DEFAULT_MEAL_WEIGHTS,
  MEAL_TYPES,
  MEAL_TYPE_LABEL,
  WEIGHT_LABEL,
  WEIGHT_LEVEL_BY_LABEL,
  type MealType,
} from "@/lib/budget";
import { lookupRegion, type RegionMatch } from "@/lib/region";

const WEIGHT_OPTIONS = [
  { label: "가볍게", value: "가볍게" },
  { label: "보통", value: "보통" },
  { label: "든든하게", value: "든든하게" },
];

export default function TripNewScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [regionError, setRegionError] = useState<string | undefined>();
  const [isValidatingRegion, setIsValidatingRegion] = useState(false);
  const [regionCandidates, setRegionCandidates] = useState<RegionMatch[]>([]);
  const [selectedCandidateCode, setSelectedCandidateCode] = useState<string | undefined>();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [totalBudgetText, setTotalBudgetText] = useState("");
  const [fixedCostText, setFixedCostText] = useState("");
  const [ratioText, setRatioText] = useState("");
  const [weights, setWeights] = useState<Record<MealType, string>>({
    breakfast: WEIGHT_LABEL[DEFAULT_MEAL_WEIGHTS.breakfast],
    lunch: WEIGHT_LABEL[DEFAULT_MEAL_WEIGHTS.lunch],
    dinner: WEIGHT_LABEL[DEFAULT_MEAL_WEIGHTS.dinner],
  });

  const totalBudget = parseDigits(totalBudgetText);
  const fixedCost = parseDigits(fixedCostText);
  const ratio = parseDigits(ratioText);

  const isValidDateRange = Boolean(
    startDate && endDate && startDate <= endDate,
  );

  const budgetError =
    totalBudgetText.length > 0 && totalBudget <= fixedCost
      ? "전체 예산은 고정비용 보다 커야해요"
      : undefined;

  const canConfirm = useMemo(
    () =>
      name.trim().length > 0 &&
      region.trim().length > 0 &&
      isValidDateRange &&
      totalBudget > 0 &&
      totalBudget > fixedCost &&
      ratio > 0 &&
      ratio <= 100,
    [name, region, isValidDateRange, totalBudget, fixedCost, ratio],
  );

  const navigateWithRegion = (matchedRegion: RegionMatch) => {
    const floatingBudget = Math.floor(
      ((totalBudget - fixedCost) * ratio) / 100,
    );
    router.push({
      pathname: "/budget/result",
      params: {
        name,
        region: matchedRegion.regionName,
        regionCode: matchedRegion.regionCode,
        regionDisplayName: matchedRegion.displayName,
        startDate: startDate ?? "",
        endDate: endDate ?? "",
        totalBudget: String(totalBudget),
        fixedCost: String(fixedCost),
        ratio: String(ratio),
        floatingBudget: String(floatingBudget),
        breakfastWeight:
          WEIGHT_LEVEL_BY_LABEL[
            weights.breakfast as keyof typeof WEIGHT_LEVEL_BY_LABEL
          ],
        lunchWeight:
          WEIGHT_LEVEL_BY_LABEL[
            weights.lunch as keyof typeof WEIGHT_LEVEL_BY_LABEL
          ],
        dinnerWeight:
          WEIGHT_LEVEL_BY_LABEL[
            weights.dinner as keyof typeof WEIGHT_LEVEL_BY_LABEL
          ],
      },
    });
  };

  const handleConfirm = async () => {
    if (!canConfirm || isValidatingRegion) {
      return;
    }
    if (regionCandidates.length > 0) {
      const picked = regionCandidates.find(
        (candidate) => candidate.regionCode === selectedCandidateCode,
      );
      if (picked) {
        navigateWithRegion(picked);
      }
      return;
    }
    setRegionError(undefined);
    setIsValidatingRegion(true);
    let result;
    try {
      result = await lookupRegion(region.trim());
    } finally {
      setIsValidatingRegion(false);
    }
    if (result.status === "not_found") {
      setRegionError("조회할 수 없는 지역입니다");
      return;
    }
    if (result.status === "ambiguous") {
      setRegionCandidates(result.candidates);
      setSelectedCandidateCode(undefined);
      return;
    }
    navigateWithRegion(result.region);
  };

  return (
    <View style={styles.container}>
      <Header
        title="새 여행 만들기"
        onBackPress={() => router.back()}
        topInset={insets.top}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FormField label="여행 이름">
          <TextField
            value={name}
            onChangeText={setName}
            placeholder="예: 친구들과 대구 여행"
          />
        </FormField>
        <FormField label="지역">
          <TextField
            value={region}
            onChangeText={(text) => {
              setRegion(text);
              setRegionError(undefined);
              setRegionCandidates([]);
              setSelectedCandidateCode(undefined);
            }}
            placeholder="예: 대구"
            error={regionError}
          />
        </FormField>
        {regionCandidates.length > 0 ? (
          <>
            <Notice
              variant="sky"
              content="같은 이름의 지역이 여러 곳이에요. 하나를 선택해주세요."
            />
            <ChipList
              label="지역 선택"
              options={regionCandidates.map((candidate) => ({
                label: candidate.regionName,
                value: candidate.regionCode,
              }))}
              value={selectedCandidateCode ?? ""}
              onChange={setSelectedCandidateCode}
            />
          </>
        ) : null}
        <FormField label="기간">
          <DateRangeField
            startDate={startDate}
            endDate={endDate}
            onChange={(nextStart, nextEnd) => {
              setStartDate(nextStart);
              setEndDate(nextEnd);
            }}
          />
        </FormField>
        <Notice
          variant="sky"
          content="지역과 기간은 생성 후 수정할 수 없어요. 변경이 필요하면 새 여행을 만들어야 합니다."
        />
        <FormField label="전체 예산">
          <TextField
            value={formatDigitsForDisplay(totalBudgetText)}
            onChangeText={(text) =>
              setTotalBudgetText(
                parseDigits(text) > 0 ? String(parseDigits(text)) : "",
              )
            }
            placeholder="예: 480,000"
            error={budgetError}
            tailingIcon={
              <KrwIcon
                color={
                  budgetError
                    ? colors.border.error.default
                    : colors.content.neutral.default
                }
              />
            }
          />
        </FormField>
        <FormField label="고정비용">
          <TextField
            value={formatDigitsForDisplay(fixedCostText)}
            onChangeText={(text) =>
              setFixedCostText(
                parseDigits(text) > 0 ? String(parseDigits(text)) : "",
              )
            }
            placeholder="예: 180,000"
            tailingIcon={<KrwIcon color={colors.content.neutral.default} />}
          />
        </FormField>
        <FormField label="식비 비율">
          <TextField
            value={ratioText}
            onChangeText={(text) =>
              setRatioText(
                parseDigits(text) > 0 ? String(parseDigits(text)) : "",
              )
            }
            placeholder="예: 35"
            tailingIcon={<PercentIcon color={colors.content.neutral.default} />}
          />
        </FormField>
        <FormField label="끼니별 가중치">
          <View style={styles.weightRows}>
            {MEAL_TYPES.map((mealType) => (
              <ChipList
                key={mealType}
                label={MEAL_TYPE_LABEL[mealType]}
                options={WEIGHT_OPTIONS}
                value={weights[mealType]}
                onChange={(value) =>
                  setWeights((prev) => ({ ...prev, [mealType]: value }))
                }
              />
            ))}
          </View>
        </FormField>
        {totalBudgetText.length > 0 &&
        fixedCostText.length > 0 &&
        ratioText.length > 0 &&
        !budgetError ? (
          <Notice
            variant="grey"
            title="예상 식비 예산"
            content={`(${formatWon(totalBudget)} - 고정비용 ${formatWon(fixedCost)}) × 식비 비율 ${ratio}% = ${formatWon(
              Math.floor(((totalBudget - fixedCost) * ratio) / 100),
            )}`}
          />
        ) : null}
      </ScrollView>
      <Footer
        label={isValidatingRegion ? "확인 중..." : "확인"}
        disabled={
          !canConfirm ||
          isValidatingRegion ||
          (regionCandidates.length > 0 && !selectedCandidateCode)
        }
        onPress={handleConfirm}
        bottomInset={insets.bottom}
      />
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
    gap: spacing[16],
  },
  weightRows: {
    gap: spacing[10],
  },
});
