import { useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

import { formatWon, parseDigits } from "@/lib/format";
import { getTripDates } from "@/lib/mock/trip";
import { useTripStore } from "@/lib/mock/tripStore";

interface EditableBudget {
  name: string;
  totalBudget: number;
  fixedCost: number;
  floatingBudget: number;
}

type EditableField = keyof EditableBudget;

const FIELD_LABEL: Record<EditableField, string> = {
  name: "여행 이름",
  totalBudget: "전체 예산",
  fixedCost: "고정비용",
  floatingBudget: "유동비용",
};

const toEditableBudget = (trip: {
  name: string;
  totalBudget: number;
  fixedCost: number;
  floatingBudget: number;
}) => ({
  name: trip.name,
  totalBudget: trip.totalBudget,
  fixedCost: trip.fixedCost,
  floatingBudget: trip.floatingBudget,
});

export default function TripEditScreen() {
  const insets = useSafeAreaInsets();
  const { trip, mealSlots, applyBudgetEdit } = useTripStore();
  const [committed, setCommitted] = useState<EditableBudget>(() =>
    toEditableBudget(trip),
  );
  const [draft, setDraft] = useState<EditableBudget>(() =>
    toEditableBudget(trip),
  );
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

  const hasPendingChanges =
    draft.name !== committed.name ||
    draft.totalBudget !== committed.totalBudget ||
    draft.fixedCost !== committed.fixedCost ||
    draft.floatingBudget !== committed.floatingBudget;

  const isBudgetSumValid =
    draft.totalBudget >= draft.fixedCost + draft.floatingBudget;
  const isFloatingBudgetValid = draft.floatingBudget >= recordedBudgetTotal;
  const isValid = isBudgetSumValid && isFloatingBudgetValid;
  const validationError = !isBudgetSumValid
    ? "전체 예산이 고정비용+유동비용 보다 적어요"
    : !isFloatingBudgetValid
      ? "유동비용이 이미 기록된 끼니 예산 합보다 적어요"
      : null;
  const isOverBudget = consumed > committed.floatingBudget;
  const trackProgress =
    committed.floatingBudget > 0
      ? (consumed / committed.floatingBudget) * 100
      : 0;

  const remaining = Math.max(committed.floatingBudget - consumed, 0);

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

  const handleConfirm = () => {
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
    if (
      draft.floatingBudget !== committed.floatingBudget &&
      unrecordedCount > 0
    ) {
      lines.push(
        `재분배: 아직 기록 안 한 끼니 ${unrecordedCount}개 예산이 다시 계산됐어요`,
      );
    }
    applyBudgetEdit(draft);
    setChangeLines(lines);
    setCommitted(draft);
    setEditingField(null);
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
              전체 식비 예산 {formatWon(committed.floatingBudget)}
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
          {readOnlyRow("지역", trip.regionName)}
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
        label="수정 완료"
        disabled={!hasPendingChanges || !isValid}
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
