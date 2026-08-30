import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  Button,
  Chip,
  FormField,
  Icon,
  Switch,
  TextField,
  colors,
  getFontFamily,
  spacing,
  typography,
} from "@repo/ui";

import { MEAL_TYPES, MEAL_TYPE_LABEL, type MealType } from "@/lib/budget";
import { formatDigitsForDisplay, parseDigits } from "@/lib/format";

import { ReceiptUploadBox } from "../ReceiptUploadBox";
import { StoreSearchModal, type StoreSearchResult } from "../StoreSearchModal";
import { DropdownField, type DropdownOption } from "../DropdownField";

export type MealLogCategory = "식비" | "교통" | "숙박" | "기념품" | "기타";

const CATEGORY_OPTIONS: MealLogCategory[] = ["식비", "교통", "숙박", "기념품", "기타"];

const MEAL_TYPE_OPTIONS: DropdownOption[] = MEAL_TYPES.map((mealType) => ({
  value: mealType,
  label: MEAL_TYPE_LABEL[mealType],
}));

const todayDate = () => new Date().toISOString().slice(0, 10);

// 아직 오지 않은 날짜는 방문 기록 대상이 아니므로 드롭다운에 노출하지 않는다.
// 일차 번호는 여행 전체 기간 기준으로 매겨야 해서 필터링 전에 index를 먼저 계산한다.
function buildTripDayOptions(dates: string[]): DropdownOption[] {
  const today = todayDate();
  return dates
    .map((date, index) => {
      const [, month, day] = date.split("-");
      return {
        value: date,
        label: `${index + 1}일차 | ${month}.${day}`,
      };
    })
    .filter((option) => option.value <= today);
}

export interface RecordFormMealSlot {
  id: string;
  date: string;
  mealType: MealType;
  isRecorded: boolean;
}

export interface RecordFormValues {
  category: MealLogCategory | "";
  amount: string;
  storeName: string;
  storeAddress: string;
  memo: string;
  mealSlotId: string | null;
}

/**
 * @param initialValues 진입 경로(F6-1)에 따라 미리 채워진 값 (optional). category가
 * '식비'가 아닌 값으로 주어지면 끼니 소비 토글이 꺼진 채로 시작한다
 * @param submitting 저장 요청 진행 중 여부 (optional, 기본값 false)
 * @param tripDates 여행 기간 내 날짜 목록(YYYY-MM-DD 오름차순), 방문 날짜 드롭다운 옵션으로 사용
 * @param mealSlots 여행의 전체 끼니 슬롯(id/날짜/끼니때/기록 여부) — 끼니 때 드롭다운에서
 * 선택한 날짜에 이미 기록된 끼니를 제외하고, 선택된 날짜+끼니때에 해당하는 슬롯 id를
 * 찾아 onSubmit의 mealSlotId로 전달하는 데 사용
 * @param onSubmit 저장 버튼을 눌렀을 때 폼 값을 전달하는 콜백
 */
export interface RecordFormProps {
  initialValues?: Partial<RecordFormValues>;
  submitting?: boolean;
  tripDates: string[];
  mealSlots: RecordFormMealSlot[];
  onSubmit: (values: RecordFormValues) => void;
}

// 값을 직접 타이핑하지 않고, 눌렀을 때 별도 선택 UI(바텀시트/검색 모달)를 여는
// 필드에 공통으로 쓰는 표시용 TextField 래퍼.
const PickerField = ({
  value,
  placeholder,
  onPress,
  showChevron = true,
}: {
  value: string;
  placeholder: string;
  onPress: () => void;
  showChevron?: boolean;
}) => (
  <Pressable onPress={onPress}>
    <View pointerEvents="none">
      <TextField
        value={value}
        onChangeText={() => {}}
        placeholder={placeholder}
        tailingIcon={showChevron ? <Icon name="chevron-down" size="medium" /> : undefined}
      />
    </View>
  </Pressable>
);

export const RecordForm = ({
  initialValues,
  submitting = false,
  tripDates,
  mealSlots,
  onSubmit,
}: RecordFormProps) => {
  const initialCategory = initialValues?.category;
  const [isMeal, setIsMeal] = useState(!initialCategory || initialCategory === "식비");
  const [category, setCategory] = useState<MealLogCategory | "">(
    initialCategory ?? (isMeal ? "식비" : ""),
  );
  const [amount, setAmount] = useState(initialValues?.amount ?? "");
  const [storeName, setStoreName] = useState(initialValues?.storeName ?? "");
  // 주소는 매장 검색 결과 선택으로만 채워진다 (F6-10) — 사용자가 직접 타이핑하지
  // 않으므로 항상 disabled 상태의 TextField로만 보여준다.
  const [storeAddress, setStoreAddress] = useState(initialValues?.storeAddress ?? "");
  const [memo, setMemo] = useState(initialValues?.memo ?? "");
  const [visitDate, setVisitDate] = useState("");
  const [mealType, setMealType] = useState("");
  const [isStoreSearchVisible, setIsStoreSearchVisible] = useState(false);

  const tripDayOptions = useMemo(() => buildTripDayOptions(tripDates), [tripDates]);
  const availableMealTypeOptions = useMemo(() => {
    const recordedMealTypes = new Set(
      mealSlots
        .filter((slot) => slot.date === visitDate && slot.isRecorded)
        .map((slot) => slot.mealType),
    );
    return MEAL_TYPE_OPTIONS.filter(
      (option) => !recordedMealTypes.has(option.value as MealType),
    );
  }, [mealSlots, visitDate]);

  const handleVisitDateChange = (nextDate: string) => {
    setVisitDate(nextDate);
    setMealType("");
  };

  const handleToggleMeal = () => {
    setIsMeal((prev) => {
      const next = !prev;
      setCategory(next ? "식비" : "");
      return next;
    });
  };

  const handleAmountChange = (text: string) => {
    const digits = parseDigits(text);
    setAmount(digits > 0 ? String(digits) : "");
  };

  const handleReceiptUpload = () =>
    Alert.alert("준비 중", "영수증 OCR 자동 채우기는 별도 이슈에서 진행돼요.");

  const handleSelectStore = (result: StoreSearchResult) => {
    setStoreName(result.name);
    setStoreAddress(result.address);
    setIsStoreSearchVisible(false);
  };

  const amountValue = Number(amount);
  const isAmountValid = amount.length > 0 && Number.isFinite(amountValue) && amountValue > 0;
  // 끼니 소비(식비)는 방문 날짜+끼니 때로 특정된 meal_slot에 연결되어야만 저장 가능
  // (F6-4 캐스케이드 확정 RPC가 이 slot id를 필요로 함).
  const mealSlotId = isMeal
    ? (mealSlots.find((slot) => slot.date === visitDate && slot.mealType === mealType)?.id ?? null)
    : null;
  const isMealSelectionValid = !isMeal || mealSlotId != null;
  const canSubmit = isAmountValid && category.length > 0 && isMealSelectionValid && !submitting;

  const handleSubmit = () => {
    if (!category) return;
    onSubmit({ category, amount, storeName, storeAddress, memo, mealSlotId });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>끼니 소비</Text>
          <Switch value={isMeal} onPress={handleToggleMeal} />
        </View>

        <ReceiptUploadBox onPress={handleReceiptUpload} />

        <FormField label="방문 날짜">
          <DropdownField
            placeholder="방문 날짜를 선택하세요"
            options={tripDayOptions}
            value={visitDate}
            onChange={handleVisitDateChange}
          />
        </FormField>

        {isMeal ? (
          <FormField label="끼니 때">
            <DropdownField
              placeholder="끼니를 선택하세요"
              options={availableMealTypeOptions}
              value={mealType}
              onChange={setMealType}
            />
          </FormField>
        ) : null}

        <FormField label="매장 이름">
          <PickerField
            value={storeName}
            placeholder="매장 검색하기"
            showChevron={false}
            onPress={() => setIsStoreSearchVisible(true)}
          />
        </FormField>

        <FormField label="주소">
          <TextField value={storeAddress} onChangeText={() => {}} disabled />
        </FormField>

        <FormField label="카테고리">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {CATEGORY_OPTIONS.map((option) => {
              const disabled = isMeal ? option !== "식비" : option === "식비";
              return (
                <Chip
                  key={option}
                  text={option}
                  active={category === option}
                  disabled={disabled}
                  onPress={() => setCategory(option)}
                />
              );
            })}
          </ScrollView>
        </FormField>

        <FormField label="금액">
          <TextField
            value={formatDigitsForDisplay(amount)}
            onChangeText={handleAmountChange}
            placeholder="예: 12,000"
            keyboardType="number-pad"
            tailingIcon={<Icon name="krw" size="medium" />}
          />
        </FormField>

        <FormField label="메모">
          <TextField value={memo} onChangeText={setMemo} placeholder="예: 어묵꼬치, 생필품" />
        </FormField>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={submitting ? "저장 중..." : "저장하기"}
          disabled={!canSubmit}
          onPress={handleSubmit}
        />
      </View>

      <StoreSearchModal
        visible={isStoreSearchVisible}
        onClose={() => setIsStoreSearchVisible(false)}
        onSelect={handleSelectStore}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing[12],
    paddingHorizontal: spacing[16],
    paddingTop: spacing[24],
    paddingBottom: spacing[16],
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  toggleLabel: {
    fontFamily: getFontFamily(typography.title3Emphasized.fontWeight),
    fontSize: typography.title3Emphasized.fontSize,
    lineHeight: typography.title3Emphasized.lineHeight,
    letterSpacing: typography.title3Emphasized.letterSpacing,
    fontWeight: typography.title3Emphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  categoryRow: {
    flexDirection: "row",
    gap: spacing[10],
  },
  footer: {
    width: "100%",
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
  },
});
