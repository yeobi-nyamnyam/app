import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@apollo/client/react";
import { Header, NavBar, colors, type NavBarItemKey } from "@repo/ui";
import {
  ActiveTripDocument,
  CreateMealLogDocument,
  RecordMealLogDocument,
  SetMealLogReceiptDocument,
} from "@repo/types";

import { RecordForm, type RecordFormValues, type MealLogCategory } from "@/components/RecordForm";
import { useSession } from "@/hooks/useSession";
import { useAlertModal } from "@/hooks/useAlertModal";
import { getTripDates, type MealType } from "@/lib/budget";

type RecordSource = "home" | "recommend" | "chat" | "record";

/**
 * 소비 기록 폼 (F6, F6-1). tripId는 필수. 끼니 소비 토글이 켜진 기록(식비)은
 * record_meal_log RPC(F6-4 캐스케이드 확정 포함)로, 그 외 카테고리는 기존
 * meal_logs 단순 insert로 저장한다. preset* 파라미터는 진입 경로(F6-1,
 * home/recommend/chat)에서 자동채움할 값이다.
 */
export default function RecordNewScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    tripId: string;
    source?: RecordSource;
    presetCategory?: MealLogCategory;
    presetStoreName?: string;
    presetStoreAddress?: string;
    presetAmount?: string;
    presetVisitDate?: string;
    presetMealType?: MealType;
  }>();

  const source: RecordSource = params.source ?? "record";

  const { session } = useSession();
  const { showAlert } = useAlertModal();
  const { data } = useQuery(ActiveTripDocument, {
    variables: { userId: session?.user.id ?? "" },
    skip: !session,
    fetchPolicy: "cache-and-network",
  });
  const tripNode = data?.tripsCollection.edges[0]?.node;
  const tripDates = tripNode
    ? getTripDates({ startDate: tripNode.start_date, endDate: tripNode.end_date })
    : [];
  const mealSlots = (tripNode?.meal_slotsCollection?.edges ?? []).map((edge) => ({
    id: edge.node.id,
    date: edge.node.date,
    mealType: edge.node.meal_type as MealType,
    isRecorded: edge.node.is_recorded,
  }));

  const [createMealLog, { loading: creatingMealLog }] = useMutation(CreateMealLogDocument);
  const [recordMealLog, { loading: recordingMealLog }] = useMutation(RecordMealLogDocument);
  const [setMealLogReceipt] = useMutation(SetMealLogReceiptDocument);
  const submitting = creatingMealLog || recordingMealLog;

  const handleSubmit = async (values: RecordFormValues) => {
    try {
      let mealLogId: string | undefined;
      if (values.category === "식비") {
        if (!values.mealSlotId) {
          throw new Error("끼니를 선택해주세요.");
        }
        const { data: recordData } = await recordMealLog({
          variables: {
            tripId: params.tripId,
            mealSlotId: values.mealSlotId,
            amount: Number(values.amount),
            storeName: values.storeName || null,
            storeAddress: values.storeAddress || null,
            storeLatitude: values.storeLatitude != null ? String(values.storeLatitude) : null,
            storeLongitude: values.storeLongitude != null ? String(values.storeLongitude) : null,
            memo: values.memo || null,
            source,
          },
        });
        mealLogId = recordData?.record_meal_log?.id;
      } else {
        const { data: createData } = await createMealLog({
          variables: {
            tripId: params.tripId,
            mealSlotId: null,
            category: values.category,
            amount: Number(values.amount),
            storeName: values.storeName || null,
            storeAddress: values.storeAddress || null,
            memo: values.memo || null,
            source,
            visitDate: values.visitDate,
          },
        });
        mealLogId = createData?.insertIntomeal_logsCollection?.records[0]?.id;
      }
      if (mealLogId && values.receiptImageUrl) {
        await setMealLogReceipt({
          variables: { mealLogId, receiptImageUrl: values.receiptImageUrl, ocrRaw: values.ocrRaw },
        });
      }
      // 저장 완료 후에는 진입 경로(recommend/chat/record 등)로 되돌아가지 않고,
      // 방금 반영된 예산을 바로 확인할 수 있는 홈 탭으로 보낸다. NavBar가 탭 전환마다
      // push를 써서 스택이 깊게 쌓이기 쉬우므로, dismissAll로 현재 스택 전체를 비운
      // 뒤 replace로 홈을 확정해 뒤로가기가 record/new 이전 화면으로 새지 않게 한다.
      router.dismissAll();
      router.replace("/");
    } catch (error) {
      showAlert("저장 실패", error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
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
    if (key === "chat") {
      router.push("/chat");
      return;
    }
    if (key === "profile") {
      router.push("/mypage");
      return;
    }
    showAlert("준비 중", "아직 구현되지 않은 탭이에요.");
  };

  return (
    <View style={styles.screen}>
      <Header title="소비 기록 작성" topInset={insets.top} onBackPress={() => router.back()} />
      <RecordForm
        tripId={params.tripId}
        submitting={submitting}
        tripDates={tripDates}
        mealSlots={mealSlots}
        initialValues={{
          category: params.presetCategory,
          storeName: params.presetStoreName,
          storeAddress: params.presetStoreAddress,
          amount: params.presetAmount,
          visitDate: params.presetVisitDate,
          mealType: params.presetMealType,
        }}
        onSubmit={handleSubmit}
      />
      <NavBar active="record" onChange={handleNavChange} bottomInset={insets.bottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
});
