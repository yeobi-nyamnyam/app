import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Button, Text, colors, radius, spacing, stroke, typography } from "@repo/ui";

export type MealLogCategory = "식비" | "교통" | "숙박" | "기념품" | "기타";

const CATEGORY_OPTIONS: MealLogCategory[] = ["식비", "교통", "숙박", "기념품", "기타"];

const MEAL_TYPE_LABEL: Record<string, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
};

export interface MealSlotContext {
  date: string;
  mealType: string;
  availableAmount: number;
}

export interface RecordFormValues {
  category: MealLogCategory;
  amount: string;
  storeName: string;
  storeAddress: string;
  memo: string;
}

/**
 * @param initialValues 진입 경로(F6-1)에 따라 미리 채워진 값 (optional)
 * @param mealSlot 끼니 슬롯에 연결된 기록일 때만 전달되는 슬롯 컨텍스트 (optional).
 * 값이 있으면 category가 '식비'로 고정되고, 저장 버튼은 비활성화된다 —
 * 캐스케이드 확정(F6-4)이 RPC로 연결되기 전까지는 끼니 연결 기록을 저장할 수 없음
 * @param submitting 저장 요청 진행 중 여부 (optional, 기본값 false)
 * @param onSubmit 저장 버튼을 눌렀을 때 폼 값을 전달하는 콜백
 */
export interface RecordFormProps {
  initialValues?: Partial<RecordFormValues>;
  mealSlot?: MealSlotContext;
  submitting?: boolean;
  onSubmit: (values: RecordFormValues) => void;
}

export const RecordForm = ({
  initialValues,
  mealSlot,
  submitting = false,
  onSubmit,
}: RecordFormProps) => {
  const [category, setCategory] = useState<MealLogCategory>(
    mealSlot ? "식비" : (initialValues?.category ?? "기타"),
  );
  const [amount, setAmount] = useState(initialValues?.amount ?? "");
  const [storeName, setStoreName] = useState(initialValues?.storeName ?? "");
  const [storeAddress, setStoreAddress] = useState(initialValues?.storeAddress ?? "");
  const [memo, setMemo] = useState(initialValues?.memo ?? "");

  const amountValue = Number(amount);
  const isAmountValid = amount.length > 0 && Number.isFinite(amountValue) && amountValue > 0;
  const canSubmit = isAmountValid && !mealSlot && !submitting;

  const handleSubmit = () => {
    onSubmit({ category, amount, storeName, storeAddress, memo });
  };

  return (
    <View style={styles.container}>
      {mealSlot ? (
        <View style={styles.mealSlotCard}>
          <Text variant="footnoteEmphasized" color="subtle">
            {mealSlot.date} · {MEAL_TYPE_LABEL[mealSlot.mealType] ?? mealSlot.mealType}
          </Text>
          <Text variant="headlineEmphasized">
            사용 가능 금액 {mealSlot.availableAmount.toLocaleString()}원
          </Text>
        </View>
      ) : null}

      <View style={styles.field}>
        <Text variant="footnoteEmphasized" color="subtle">
          카테고리
        </Text>
        <View style={styles.categoryRow}>
          {CATEGORY_OPTIONS.map((option) => {
            const selected = option === category;
            const lockedByMealSlot = Boolean(mealSlot);
            return (
              <Pressable
                key={option}
                disabled={lockedByMealSlot}
                style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                onPress={() => setCategory(option)}
              >
                <Text variant="footnoteEmphasized" color={selected ? "inverse" : "default"}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.field}>
        <Text variant="footnoteEmphasized" color="subtle">
          금액
        </Text>
        <TextInput
          value={amount}
          onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.content.neutral.subtlest}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text variant="footnoteEmphasized" color="subtle">
          매장명 (선택)
        </Text>
        <TextInput
          value={storeName}
          onChangeText={setStoreName}
          placeholder="매장명을 입력하세요"
          placeholderTextColor={colors.content.neutral.subtlest}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text variant="footnoteEmphasized" color="subtle">
          주소 (선택)
        </Text>
        <TextInput
          value={storeAddress}
          onChangeText={setStoreAddress}
          placeholder="주소를 입력하세요"
          placeholderTextColor={colors.content.neutral.subtlest}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text variant="footnoteEmphasized" color="subtle">
          메모 (선택)
        </Text>
        <TextInput
          value={memo}
          onChangeText={setMemo}
          placeholder="메모를 입력하세요"
          placeholderTextColor={colors.content.neutral.subtlest}
          style={[styles.input, styles.memoInput]}
          multiline
        />
      </View>

      {mealSlot ? (
        <Text variant="footnoteRegular" color="subtlest">
          끼니 슬롯에 연결된 기록의 캐스케이드 확정 저장은 다음 이슈(F6-4)에서 연결됩니다.
        </Text>
      ) : null}

      <Button
        label={submitting ? "저장 중..." : "저장"}
        disabled={!canSubmit}
        onPress={handleSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing[20],
  },
  mealSlotCard: {
    gap: spacing[4],
    padding: spacing[16],
    borderRadius: radius[16],
    backgroundColor: colors.surface.neutral.subtle,
  },
  field: {
    gap: spacing[8],
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[8],
  },
  categoryChip: {
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[16],
    borderRadius: radius.full,
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.default,
  },
  categoryChipSelected: {
    backgroundColor: colors.surface.primary.active,
    borderColor: colors.surface.primary.active,
  },
  input: {
    height: 48,
    paddingHorizontal: spacing[16],
    borderRadius: radius[10],
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.default,
    fontFamily: typography.fontFamily,
    fontSize: typography.bodyRegular.fontSize,
    color: colors.content.neutral.default,
  },
  memoInput: {
    height: 96,
    paddingTop: spacing[12],
    textAlignVertical: "top",
  },
});
