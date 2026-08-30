import { Alert, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@apollo/client/react";
import { Header, NavBar, colors, type NavBarItemKey } from "@repo/ui";
import { ActiveTripDocument, CreateMealLogDocument } from "@repo/types";

import { RecordForm, type RecordFormValues, type MealLogCategory } from "@/components/RecordForm";
import { useSession } from "@/hooks/useSession";
import { getTripDates, type MealType } from "@/lib/budget";

type RecordSource = "home" | "recommend" | "chat" | "record";

/**
 * 소비 기록 폼 (F6, F6-1). tripId는 필수. 끼니 소비 토글이 켜진 기록(식비)은
 * 끼니 슬롯 연결·캐스케이드 확정(F6-4)이 붙기 전까지 저장이 비활성화된다
 * (RecordForm 참고). preset* 파라미터는 진입 경로(F6-1, home/recommend/chat)에서
 * 자동채움할 값이다.
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

  const { session } = useSession();
  const { data } = useQuery(ActiveTripDocument, {
    variables: { userId: session?.user.id ?? "" },
    skip: !session,
  });
  const tripNode = data?.tripsCollection.edges[0]?.node;
  const tripDates = tripNode
    ? getTripDates({ startDate: tripNode.start_date, endDate: tripNode.end_date })
    : [];
  const mealSlots = (tripNode?.meal_slotsCollection?.edges ?? []).map((edge) => ({
    date: edge.node.date,
    mealType: edge.node.meal_type as MealType,
    isRecorded: edge.node.is_recorded,
  }));

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

  const handleNavChange = (key: NavBarItemKey) => {
    if (key === "home") {
      router.push("/");
      return;
    }
    if (key === "recommend") {
      router.push("/recommend");
      return;
    }
    if (key === "record") {
      router.push("/record");
      return;
    }
    Alert.alert("준비 중", "아직 구현되지 않은 탭이에요.");
  };

  return (
    <View style={styles.screen}>
      <Header title="소비 기록 작성" topInset={insets.top} onBackPress={() => router.back()} />
      <RecordForm
        submitting={submitting}
        tripDates={tripDates}
        mealSlots={mealSlots}
        initialValues={{
          category: params.presetCategory,
          storeName: params.presetStoreName,
          storeAddress: params.presetStoreAddress,
          amount: params.presetAmount,
        }}
        onSubmit={handleSubmit}
      />
      <View style={{ paddingBottom: insets.bottom }}>
        <NavBar active="record" onChange={handleNavChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
});
