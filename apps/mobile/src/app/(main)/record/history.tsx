import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@apollo/client/react";
import { Chip, Header, NavBar, RecordCard, Text, colors, spacing, type NavBarItemKey } from "@repo/ui";
import { TripHistoryDocument, TripMealLogsDocument } from "@repo/types";

import { formatDateWithWeekday, formatTime, formatWon } from "@/lib/format";
import { MEAL_TYPES, MEAL_TYPE_LABEL, type MealType } from "@/lib/budget";

type HistoryFilter = "전체" | "끼니" | "소비" | "일기";

const FILTERS: HistoryFilter[] = ["전체", "끼니", "소비", "일기"];

/**
 * 여행별 소비 기록 목록 (F6-9, Figma "trip-history"). record/index.tsx의 여행
 * 목록에서 여행 카드를 눌러 진입한다. 날짜별로 묶어 최신순으로 보여주고, 항목을
 * 누르면 수정/삭제 화면(record/edit.tsx)으로 이동한다. "일기" 필터는 일기(D0~D3)
 * 기능이 아직 없어 자리만 마련해둔다.
 */
export default function RecordHistoryScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tripId: string; tripName: string }>();
  const [filter, setFilter] = useState<HistoryFilter>("전체");

  const { data: tripData } = useQuery(TripHistoryDocument, {
    variables: { tripId: params.tripId },
  });
  const tripNode = tripData?.tripsCollection.edges[0]?.node;

  const { data: mealLogsData, loading } = useQuery(TripMealLogsDocument, {
    variables: { tripId: params.tripId },
    fetchPolicy: "cache-and-network",
  });

  const mealSlots = (tripNode?.meal_slotsCollection?.edges ?? []).map((edge) => ({
    id: edge.node.id,
    date: edge.node.date,
    mealType: edge.node.meal_type as MealType,
    isRecorded: edge.node.is_recorded,
  }));
  const mealSlotById = new Map(mealSlots.map((slot) => [slot.id, slot]));
  // record_meal_log/delete_meal_log와 동일한 정렬 기준(날짜 → 아침/점심/저녁)
  const sortedMealSlots = [...mealSlots].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return MEAL_TYPES.indexOf(a.mealType) - MEAL_TYPES.indexOf(b.mealType);
  });
  // F6-5: 바로 다음 끼니가 이미 기록되어 있으면 삭제 불가
  const isMealSlotDeletable = (mealSlotId: string) => {
    const index = sortedMealSlots.findIndex((slot) => slot.id === mealSlotId);
    const nextSlot = sortedMealSlots[index + 1];
    return !nextSlot || !nextSlot.isRecorded;
  };

  const allMealLogs = mealLogsData?.meal_logsCollection.edges ?? [];
  const mealLogs =
    filter === "일기"
      ? []
      : filter === "끼니"
        ? allMealLogs.filter(({ node }) => node.meal_slot_id != null)
        : filter === "소비"
          ? allMealLogs.filter(({ node }) => node.meal_slot_id == null)
          : allMealLogs;

  // meal_logsCollection이 created_at 내림차순으로 오므로, 순서를 유지한 채
  // 날짜(로컬 기준)가 바뀌는 지점마다 새 그룹을 만든다.
  const groups: { dateLabel: string; logs: typeof mealLogs }[] = [];
  mealLogs.forEach((edge) => {
    const dateLabel = formatDateWithWeekday(edge.node.created_at);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.dateLabel === dateLabel) {
      lastGroup.logs.push(edge);
    } else {
      groups.push({ dateLabel, logs: [edge] });
    }
  });

  const goToEdit = (node: (typeof mealLogs)[number]["node"]) => {
    const slot = node.meal_slot_id ? mealSlotById.get(node.meal_slot_id) : undefined;
    router.push({
      pathname: "/record/edit",
      params: {
        logId: node.id,
        title: node.store_name || (slot ? MEAL_TYPE_LABEL[slot.mealType] : node.category),
        category: node.category,
        mealTypeLabel: slot ? MEAL_TYPE_LABEL[slot.mealType] : "",
        createdAt: node.created_at,
        amount: String(node.amount),
        storeName: node.store_name ?? "",
        storeAddress: node.store_address ?? "",
        memo: node.memo ?? "",
        canDelete: node.meal_slot_id ? String(isMealSlotDeletable(node.meal_slot_id)) : "true",
      },
    });
  };

  const handleNavChange = (key: NavBarItemKey) => {
    if (key === "record") {
      router.push("/record");
      return;
    }
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
      <Header
        title={params.tripName}
        textAlign="start"
        tailing="text"
        tailingText="예산 변동 히스토리 보기"
        onBackPress={() => router.back()}
        onTailingPress={() => Alert.alert("준비 중", "예산 변동 히스토리는 아직 준비 중이에요.")}
      />
      <View style={styles.filterRow}>
        {FILTERS.map((option) => (
          <Chip key={option} text={option} active={filter === option} onPress={() => setFilter(option)} />
        ))}
      </View>
      <View style={styles.body}>
        {loading && !mealLogsData ? (
          <View style={styles.emptyState}>
            <Text color="subtlest">기록 불러오는 중...</Text>
          </View>
        ) : groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text color="subtlest">아직 기록이 없어요.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {groups.map((group) => (
              <View key={group.dateLabel} style={styles.section}>
                <Text variant="title3Emphasized">{group.dateLabel}</Text>
                {group.logs.map(({ node }) => (
                  <RecordCard
                    key={node.id}
                    title={node.store_name ?? node.memo ?? node.category}
                    period={formatTime(node.created_at)}
                    budget={formatWon(node.amount)}
                    onPress={() => goToEdit(node)}
                  />
                ))}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
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
  filterRow: {
    flexDirection: "row",
    gap: spacing[6],
    paddingHorizontal: spacing[16],
    paddingTop: spacing[24],
  },
  body: {
    flex: 1,
  },
  content: {
    padding: spacing[16],
    gap: spacing[20],
  },
  section: {
    gap: spacing[8],
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
