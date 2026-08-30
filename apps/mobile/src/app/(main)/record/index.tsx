import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@apollo/client/react";
import {
  CTACard,
  EmptyTripPrompt,
  ListRow,
  NavBar,
  Text,
  UnderlineTabs,
  colors,
  spacing,
  type NavBarItemKey,
} from "@repo/ui";
import { ActiveTripDocument, TripMealLogsDocument } from "@repo/types";

import { useSession } from "@/hooks/useSession";
import { formatWon } from "@/lib/format";
import { MEAL_TYPE_LABEL, type MealType } from "@/lib/budget";

const TABS = ["기록 작성하기", "기록보기"];

/**
 * 기록 탭 진입 화면 (Figma "write"). 소비 기록/여행 일기 작성 진입점 + 기록보기 탭.
 * 일기(D0~D3)는 기록 기능 개발이 끝난 뒤 별도로 작업하므로 여기서는 진입 버튼만 둔다.
 * "기록보기"(F6-8/F6-9)는 여행 전체 소비 기록을 최신순으로 보여주는 최소 목록만 우선
 * 구현했다 — 수정/삭제(F6-5/F6-6) 진입은 별도 이슈에서 이어서 붙인다.
 */
export default function RecordWriteScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);
  const { session } = useSession();
  const { data, loading } = useQuery(ActiveTripDocument, {
    variables: { userId: session?.user.id ?? "" },
    skip: !session,
    fetchPolicy: "cache-and-network",
  });
  const tripNode = data?.tripsCollection.edges[0]?.node;
  const tripId = tripNode?.id;

  const { data: mealLogsData, loading: mealLogsLoading } = useQuery(TripMealLogsDocument, {
    variables: { tripId: tripId ?? "" },
    skip: !tripId,
  });
  const mealSlotById = new Map(
    (tripNode?.meal_slotsCollection?.edges ?? []).map((edge) => [
      edge.node.id,
      { date: edge.node.date, mealType: edge.node.meal_type as MealType },
    ]),
  );
  const mealLogs = mealLogsData?.meal_logsCollection.edges ?? [];

  const handleRecordPress = () => router.push(`/record/new?tripId=${tripId}`);

  const handleNavChange = (key: NavBarItemKey) => {
    if (key === "record") return;
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
    if (key === "profile") {
      router.push("/mypage");
      return;
    }
    Alert.alert("준비 중", "아직 구현되지 않은 탭이에요.");
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <UnderlineTabs tabs={TABS} activeIndex={activeTab} onChange={setActiveTab} />
      {activeTab === 0 ? (
        loading && !data ? (
          <View style={styles.emptyState}>
            <Text color="subtlest">여행 정보 불러오는 중...</Text>
          </View>
        ) : tripId ? (
          <ScrollView contentContainerStyle={styles.content}>
            <Text>오늘의 소비와 여행 일기를 남겨보세요</Text>
            <CTACard
              title="소비 기록 작성"
              description="끼니 소비와 기타 소비를 기록해보세요"
              buttonLabel="작성하기"
              onPress={handleRecordPress}
            />
            <CTACard
              title="여행 일기 작성"
              description="오늘 하루의 여행을 글로 남겨보세요"
              buttonLabel="작성하기"
              onPress={() => Alert.alert("준비 중", "일기 기능은 기록 개발 완료 후 추가돼요.")}
            />
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <EmptyTripPrompt
              onCreateTrip={() => router.push("/trip-create")}
              onLoadPastTrip={() =>
                Alert.alert("준비 중", "과거 여행 불러오기는 아직 준비 중이에요.")
              }
            />
          </View>
        )
      ) : mealLogsLoading && !mealLogsData ? (
        <View style={styles.emptyState}>
          <Text color="subtlest">기록 불러오는 중...</Text>
        </View>
      ) : mealLogs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text color="subtlest">아직 기록이 없어요.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {mealLogs.map(({ node }) => {
            const slot = node.meal_slot_id ? mealSlotById.get(node.meal_slot_id) : undefined;
            const title = slot
              ? `${MEAL_TYPE_LABEL[slot.mealType]} · ${node.store_name ?? node.memo ?? "식비"}`
              : `${node.category} · ${node.store_name ?? node.memo ?? ""}`;
            return <ListRow key={node.id} title={title} tailing={formatWon(node.amount)} />;
          })}
        </ScrollView>
      )}
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
  content: {
    padding: spacing[16],
    gap: spacing[12],
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
