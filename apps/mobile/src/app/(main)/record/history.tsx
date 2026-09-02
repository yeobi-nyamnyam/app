import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@apollo/client/react";
import { Chip, Header, NavBar, RecordCard, Text, colors, spacing, type NavBarItemKey } from "@repo/ui";
import { TripDiariesDocument, TripHistoryDocument, TripMealLogsDocument } from "@repo/types";

import { formatDateWithWeekday, formatTime, formatWon } from "@/lib/format";
import { MEAL_TYPES, MEAL_TYPE_LABEL, getTripDates, type MealType } from "@/lib/budget";

type HistoryFilter = "전체" | "끼니" | "소비" | "일기";

const FILTERS: HistoryFilter[] = ["전체", "끼니", "소비", "일기"];

const DIARY_MODE_LABEL: Record<string, string> = {
  ai: "AI 초안 일기",
  manual: "직접 작성 일기",
};

/**
 * 여행별 소비 기록 목록 (F6-9, Figma "trip-history"). record/index.tsx의 여행
 * 목록에서 여행 카드를 눌러 진입한다. 날짜별로 묶어 최신순으로 보여주고, 끼니/소비
 * 항목을 누르면 수정/삭제 화면(record/edit.tsx)으로, 일기 항목을 누르면 일기 상세
 * (D4, diary/detail.tsx)로 이동한다. "일기" 필터는 일기만, "전체"는 끼니/소비/일기를
 * 날짜별로 섞어서 보여준다.
 */
export default function RecordHistoryScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tripId: string; tripName: string }>();
  const [filter, setFilter] = useState<HistoryFilter>("전체");

  const { data: tripData, refetch: refetchTrip } = useQuery(TripHistoryDocument, {
    variables: { tripId: params.tripId },
  });
  const tripNode = tripData?.tripsCollection.edges[0]?.node;
  const tripDates = tripNode ? getTripDates({ startDate: tripNode.start_date, endDate: tripNode.end_date }) : [];

  const dayLabelForDate = (date: string) => {
    const dayIndex = tripDates.indexOf(date);
    const [, month, day] = date.split("-");
    return dayIndex >= 0 ? `${dayIndex + 1}일차 | ${month}.${day}` : `${month}.${day}`;
  };

  const {
    data: mealLogsData,
    loading,
    refetch: refetchMealLogs,
  } = useQuery(TripMealLogsDocument, {
    variables: { tripId: params.tripId },
    fetchPolicy: "cache-and-network",
  });

  const {
    data: diariesData,
    loading: diariesLoading,
    refetch: refetchDiaries,
  } = useQuery(TripDiariesDocument, {
    variables: { tripId: params.tripId },
    fetchPolicy: "cache-and-network",
  });

  // diary/detail, diary/edit, record/edit에서 저장/삭제 후 돌아왔을 때 이 화면이
  // 그대로 마운트되어 있어서 cache-and-network만으로는 재조회가 안 된다 —
  // record/index.tsx와 동일하게 포커스를 다시 받을 때마다 명시적으로 refetch한다.
  useFocusEffect(
    useCallback(() => {
      refetchTrip();
      refetchMealLogs();
      refetchDiaries();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

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
  const allDiaries = diariesData?.diariesCollection.edges ?? [];

  type MealLogNode = (typeof allMealLogs)[number]["node"];
  type DiaryNode = (typeof allDiaries)[number]["node"];
  type HistoryEntry =
    | { kind: "meal"; sortAt: string; mealNode: MealLogNode }
    | { kind: "diary"; sortAt: string; diaryNode: DiaryNode };

  const mealEntries: HistoryEntry[] = allMealLogs.map(({ node }) => ({
    kind: "meal",
    sortAt: node.created_at,
    mealNode: node,
  }));
  const diaryEntries: HistoryEntry[] = allDiaries.map(({ node }) => ({
    kind: "diary",
    sortAt: node.created_at,
    diaryNode: node,
  }));

  const entries: HistoryEntry[] =
    filter === "일기"
      ? diaryEntries
      : filter === "끼니"
        ? mealEntries.filter((entry) => entry.kind === "meal" && entry.mealNode.meal_slot_id != null)
        : filter === "소비"
          ? mealEntries.filter((entry) => entry.kind === "meal" && entry.mealNode.meal_slot_id == null)
          : [...mealEntries, ...diaryEntries].sort((a, b) => (a.sortAt < b.sortAt ? 1 : a.sortAt > b.sortAt ? -1 : 0));

  // entries가 이미 created_at 내림차순이므로, 순서를 유지한 채 날짜(로컬 기준)가
  // 바뀌는 지점마다 새 그룹을 만든다.
  const groups: { dateLabel: string; entries: HistoryEntry[] }[] = [];
  entries.forEach((entry) => {
    const dateLabel = formatDateWithWeekday(entry.sortAt);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.dateLabel === dateLabel) {
      lastGroup.entries.push(entry);
    } else {
      groups.push({ dateLabel, entries: [entry] });
    }
  });

  const goToEdit = (node: MealLogNode) => {
    const slot = node.meal_slot_id ? mealSlotById.get(node.meal_slot_id) : undefined;
    router.push({
      pathname: "/record/edit",
      params: {
        logId: node.id,
        title: node.store_name || (slot ? MEAL_TYPE_LABEL[slot.mealType] : node.category),
        category: node.category,
        mealTypeLabel: slot ? MEAL_TYPE_LABEL[slot.mealType] : "",
        createdAt: node.created_at,
        visitDate: node.visit_date,
        amount: String(node.amount),
        storeName: node.store_name ?? "",
        storeAddress: node.store_address ?? "",
        memo: node.memo ?? "",
        canDelete: node.meal_slot_id ? String(isMealSlotDeletable(node.meal_slot_id)) : "true",
      },
    });
  };

  const goToDiaryDetail = (node: DiaryNode) => {
    router.push({
      pathname: "/diary/detail",
      params: {
        diaryId: node.id,
        tripId: params.tripId,
        dayLabel: dayLabelForDate(node.date),
        title: node.title ?? "",
        content: node.content,
        mode: node.mode,
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
        onTailingPress={() => router.push({ pathname: "/record/budget-history", params: { tripId: params.tripId } })}
      />
      <View style={styles.filterRow}>
        {FILTERS.map((option) => (
          <Chip key={option} text={option} active={filter === option} onPress={() => setFilter(option)} />
        ))}
      </View>
      <View style={styles.body}>
        {(loading && !mealLogsData) || (diariesLoading && !diariesData) ? (
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
                {group.entries.map((entry) =>
                  entry.kind === "meal" ? (
                    <RecordCard
                      key={entry.mealNode.id}
                      title={entry.mealNode.store_name ?? entry.mealNode.memo ?? entry.mealNode.category}
                      period={formatTime(entry.mealNode.created_at)}
                      budget={formatWon(entry.mealNode.amount)}
                      onPress={() => goToEdit(entry.mealNode)}
                    />
                  ) : (
                    <RecordCard
                      key={entry.diaryNode.id}
                      title={entry.diaryNode.title || "제목 없는 일기"}
                      period={DIARY_MODE_LABEL[entry.diaryNode.mode] ?? "일기"}
                      showBudget={false}
                      onPress={() => goToDiaryDetail(entry.diaryNode)}
                    />
                  ),
                )}
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
