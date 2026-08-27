import { useMemo } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@apollo/client/react";
import { Header, spacing } from "@repo/ui";
import { CreateMealLogDocument, MealSlotDocument } from "@repo/types";

import { RecordForm, type RecordFormValues, type MealLogCategory } from "@/components/RecordForm";

type RecordSource = "home" | "recommend" | "chat" | "record";

/**
 * 소비 기록 폼 (F6, F6-1). tripId는 필수, mealSlotId가 있으면 끼니 슬롯에 연결된
 * 기록으로 취급한다 (F6-4 캐스케이드 확정 RPC 연결 전까지 저장은 비활성화).
 * preset* 파라미터는 진입 경로(F6-1, home/recommend/chat)에서 자동채움할 값이다.
 */
export default function RecordNewScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    tripId: string;
    mealSlotId?: string;
    source?: RecordSource;
    presetCategory?: MealLogCategory;
    presetStoreName?: string;
    presetStoreAddress?: string;
    presetAmount?: string;
  }>();

  const source: RecordSource = params.source ?? "record";

  const { data: mealSlotData } = useQuery(MealSlotDocument, {
    variables: { id: params.mealSlotId ?? "" },
    skip: !params.mealSlotId,
  });

  const mealSlot = mealSlotData?.meal_slotsByPk;
  const mealSlotContext = useMemo(() => {
    if (!mealSlot) return undefined;
    return {
      date: mealSlot.date,
      mealType: mealSlot.meal_type,
      availableAmount: mealSlot.budget_amount + mealSlot.carried_over_amount,
    };
  }, [mealSlot]);

  const [createMealLog, { loading: submitting }] = useMutation(CreateMealLogDocument);

  const handleSubmit = async (values: RecordFormValues) => {
    try {
      await createMealLog({
        variables: {
          tripId: params.tripId,
          mealSlotId: params.mealSlotId ?? null,
          category: values.category,
          amount: Number(values.amount),
          storeName: values.storeName || null,
          storeAddress: values.storeAddress || null,
          memo: values.memo || null,
          source,
        },
      });
      router.back();
    } catch (error) {
      Alert.alert("저장 실패", error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <>
      <Header title="소비 기록" topInset={insets.top} onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <RecordForm
          mealSlot={mealSlotContext}
          submitting={submitting}
          initialValues={{
            category: params.presetCategory,
            storeName: params.presetStoreName,
            storeAddress: params.presetStoreAddress,
            amount: params.presetAmount,
          }}
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[16],
  },
});
