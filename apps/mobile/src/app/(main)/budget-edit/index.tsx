import { useState } from "react";
import { Alert as RNAlert, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  BudgetFieldRow,
  Footer,
  Header,
  Notice,
  Text,
  Track,
  colors,
  radius,
  spacing,
  typography,
} from "@repo/ui";
import { ActiveTripDocument, EditTripBudgetDocument, RegionNameDocument } from "@repo/types";

import { formatWon, parseDigits } from "@/lib/format";
import { getTripDates, redistributeUnrecordedSlots, type WeightLevel } from "@/lib/budget";
import { useSession } from "@/hooks/useSession";

interface EditableBudget {
  name: string;
  totalBudget: number;
  fixedCost: number;
  floatingBudget: number;
}

type EditableField = keyof EditableBudget;

interface EditTrip {
  id: string;
  name: string;
  regionCode: string;
  regionDisplayName: string | null;
  startDate: string;
  endDate: string;
  totalBudget: number;
  fixedCost: number;
  floatingBudget: number;
}

interface EditMealSlot {
  id: string;
  isRecorded: boolean;
  weightLevel: WeightLevel;
  budgetAmount: number;
  recordedAmount: number | null;
}

const FIELD_LABEL: Record<EditableField, string> = {
  name: "여행 이름",
  totalBudget: "전체 예산",
  fixedCost: "고정비용",
  floatingBudget: "유동비용",
};

const toEditableBudget = (trip: EditTrip): EditableBudget => ({
  name: trip.name,
  totalBudget: trip.totalBudget,
  fixedCost: trip.fixedCost,
  floatingBudget: trip.floatingBudget,
});

export default function TripEditScreen() {
  const { session } = useSession();
  const { data, loading, refetch } = useQuery(ActiveTripDocument, {
    variables: { userId: session?.user.id ?? "" },
    skip: !session,
    fetchPolicy: "cache-and-network",
  });

  if (loading && !data) {
    return null;
  }

  const tripNode = data?.tripsCollection.edges[0]?.node;
  if (!tripNode) {
    router.back();
    return null;
  }

  const trip: EditTrip = {
    id: tripNode.id,
    name: tripNode.name,
    regionCode: tripNode.region_code,
    regionDisplayName: tripNode.region_display_name ?? null,
    startDate: tripNode.start_date,
    endDate: tripNode.end_date,
    totalBudget: tripNode.total_budget,
    fixedCost: tripNode.fixed_cost,
    floatingBudget: tripNode.floating_budget,
  };
  const mealSlots: EditMealSlot[] = (tripNode.meal_slotsCollection?.edges ?? []).map((edge) => ({
    id: edge.node.id,
    isRecorded: edge.node.is_recorded,
    weightLevel: edge.node.weight_level as WeightLevel,
    budgetAmount: edge.node.budget_amount,
    recordedAmount: edge.node.recorded_amount,
  }));

  return <TripEditForm trip={trip} mealSlots={mealSlots} onSaved={() => refetch()} />;
}

function TripEditForm({
  trip,
  mealSlots,
  onSaved,
}: {
  trip: EditTrip;
  mealSlots: EditMealSlot[];
  onSaved: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [editTripBudget, { loading: isSaving }] = useMutation(EditTripBudgetDocument);
  const { data: regionData } = useQuery(RegionNameDocument, {
    variables: { code: trip.regionCode },
  });
  const regionName =
    trip.regionDisplayName ??
    regionData?.region_cacheCollection.edges[0]?.node.region_name ??
    trip.regionCode;

  const [committed, setCommitted] = useState<EditableBudget>(() => toEditableBudget(trip));
  const [draft, setDraft] = useState<EditableBudget>(() => toEditableBudget(trip));
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [editingText, setEditingText] = useState("");
  const [changeLines, setChangeLines] = useState<string[]>([]);

  const consumed = mealSlots.reduce(
    (sum, slot) => sum + (slot.recordedAmount ?? 0),
    0,
  );
  const unrecordedCount = mealSlots.filter((slot) => !slot.isRecorded).length;
  const recordedBudgetTotal = mealSlots
    .filter((slot) => slot.isRecorded)
    .reduce((sum, slot) => sum + slot.budgetAmount, 0);

  const dates = getTripDates(trip);
  const formatShortDate = (date: string | undefined) =>
    date?.slice(5).replace("-", ".") ?? "";
  const dateRangeLabel = `${formatShortDate(dates[0])} - ${formatShortDate(dates[dates.length - 1])}`;

  // floatingBudget은 "유동비용"(전체-고정-식비, 남는 금액) 그 자체를 저장하는 필드라,
  // 끼니 예산과 비교해야 하는 실제 식비는 여기서 역산해서 파생한다.
  const committedFoodBudget =
    committed.totalBudget - committed.fixedCost - committed.floatingBudget;
  const draftFoodBudget = draft.totalBudget - draft.fixedCost - draft.floatingBudget;

  const hasPendingChanges =
    draft.name !== committed.name ||
    draft.totalBudget !== committed.totalBudget ||
    draft.fixedCost !== committed.fixedCost ||
    draft.floatingBudget !== committed.floatingBudget;

  const isBudgetSumValid =
    draft.totalBudget >= draft.fixedCost + draft.floatingBudget;
  const isFoodBudgetValid = draftFoodBudget >= recordedBudgetTotal;
  const isValid = isBudgetSumValid && isFoodBudgetValid;
  const validationError = !isBudgetSumValid
    ? "전체 예산이 고정비용+유동비용 보다 적어요"
    : !isFoodBudgetValid
      ? "식비가 이미 기록된 끼니 예산 합보다 적어요"
      : null;
  const isOverBudget = consumed > committedFoodBudget;
  const trackProgress =
    committedFoodBudget > 0 ? (consumed / committedFoodBudget) * 100 : 0;

  const remaining = Math.max(committedFoodBudget - consumed, 0);

  const startEditing = (field: EditableField) => {
    setEditingText(field === "name" ? draft.name : String(draft[field]));
    setEditingField(field);
  };

  const commitFieldEdit = (field: EditableField, rawText: string) => {
    setDraft((prev) => ({
      ...prev,
      [field]: field === "name" ? rawText : parseDigits(rawText),
    }));
    setEditingField(null);
  };

  const handleConfirm = async () => {
    if (!hasPendingChanges || !isValid) {
      return;
    }
    const lines: string[] = [];
    (Object.keys(FIELD_LABEL) as EditableField[]).forEach((field) => {
      if (draft[field] === committed[field]) {
        return;
      }
      const from =
        field === "name"
          ? committed[field]
          : formatWon(committed[field] as number);
      const to =
        field === "name" ? draft[field] : formatWon(draft[field] as number);
      lines.push(`${FIELD_LABEL[field]} ${from} → ${to}`);
    });

    const redistributed = redistributeUnrecordedSlots(mealSlots, draftFoodBudget);
    const changedSlots = redistributed.filter((slot) => !slot.isRecorded);

    if (draft.floatingBudget !== committed.floatingBudget && unrecordedCount > 0) {
      lines.push(
        `재분배: 아직 기록 안 한 끼니 ${unrecordedCount}개 예산이 다시 계산됐어요`,
      );
    }

    try {
      await editTripBudget({
        variables: {
          tripId: trip.id,
          name: draft.name,
          totalBudget: draft.totalBudget,
          fixedCost: draft.fixedCost,
          floatingBudget: draft.floatingBudget,
          slotIds: changedSlots.map((slot) => slot.id),
          slotAmounts: changedSlots.map((slot) => slot.budgetAmount),
        },
      });
      setChangeLines(lines);
      setCommitted(draft);
      setEditingField(null);
      onSaved();
    } catch (error) {
      RNAlert.alert(
        "예산 수정 실패",
        error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
      );
    }
  };

  const readOnlyRow = (label: string, value: string) => (
    <BudgetFieldRow label={label} value={value} showEditIcon={false} />
  );

  const editableRow = (field: EditableField) => {
    const isEdited = draft[field] !== committed[field];
    const displayValue =
      field === "name" ? draft[field] : formatWon(draft[field] as number);

    if (editingField === field) {
      return (
        <View style={styles.editingRow}>
          <Text variant="headlineRegular">{FIELD_LABEL[field]}</Text>
          <TextInput
            autoFocus
            style={styles.inlineInput}
            value={editingText}
            onChangeText={setEditingText}
            onSubmitEditing={() => commitFieldEdit(field, editingText)}
            onBlur={() => commitFieldEdit(field, editingText)}
            keyboardType={field === "name" ? "default" : "number-pad"}
          />
        </View>
      );
    }

    return (
      <BudgetFieldRow
        label={FIELD_LABEL[field]}
        value={displayValue}
        state={isEdited ? "edited" : "default"}
        onEditPress={() => startEditing(field)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={committed.name}
        onBackPress={() => router.back()}
        topInset={insets.top}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[styles.summaryCard, isOverBudget && styles.summaryCardOver]}
        >
          <Text variant="headlineEmphasized">총 사용 식비</Text>
          <Text variant="title1Bold">{formatWon(consumed)}</Text>
          <Track progress={trackProgress} />
          <View style={styles.summaryRow}>
            <Text variant="subheadlineEmphasized">
              남은 식비 {formatWon(remaining)}
            </Text>
            <Text variant="subheadlineRegular">
              전체 식비 예산 {formatWon(committedFoodBudget)}
            </Text>
          </View>
        </View>

        {changeLines.length > 0 ? (
          <Notice
            variant="yellow"
            title="최근 변경"
            content={changeLines.join("\n")}
          />
        ) : null}

        <View style={styles.fieldCard}>
          {editableRow("name")}
          {readOnlyRow("지역", regionName)}
          {readOnlyRow("기간", dateRangeLabel)}
          {editableRow("totalBudget")}
          {editableRow("fixedCost")}
          {editableRow("floatingBudget")}
        </View>
      </ScrollView>

      {validationError ? (
        <View style={styles.alertWrapper}>
          <Alert variant="error" title={validationError} />
        </View>
      ) : null}

      <Footer
        label={isSaving ? "저장 중..." : "수정 완료"}
        disabled={!hasPendingChanges || !isValid || isSaving}
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
  summaryCard: {
    width: "100%",
    backgroundColor: colors.surface.neutral.default,
    borderWidth: 1,
    borderColor: colors.border.neutral.default,
    borderRadius: radius[23],
    padding: spacing[20],
    gap: spacing[8],
  },
  summaryCardOver: {
    borderColor: colors.border.error.default,
  },
  summaryRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldCard: {
    width: "100%",
    backgroundColor: colors.surface.neutral.default,
    borderWidth: 1,
    borderColor: colors.border.neutral.default,
    borderRadius: radius[26],
    paddingHorizontal: spacing[16],
  },
  editingRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing[8],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary.default,
  },
  inlineInput: {
    minWidth: 100,
    textAlign: "right",
    fontFamily: typography.fontFamily,
    fontSize: typography.bodyEmphasized.fontSize,
    color: colors.content.primary.default,
    padding: 0,
  },
  alertWrapper: {
    paddingHorizontal: spacing[16],
    paddingBottom: spacing[8],
  },
});
