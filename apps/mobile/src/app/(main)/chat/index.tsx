import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  Chip,
  ChatLogList,
  EmptyTripPrompt,
  Icon,
  NavBar,
  SectionHeader,
  Text,
  TextField,
  colors,
  spacing,
  type NavBarItemKey,
} from "@repo/ui";

import { formatWon } from "@/lib/format";
import { MOCK_HAS_ACTIVE_TRIP, MOCK_LOG_GROUPS, type ChatLogFilterCategory } from "@/lib/chat";

type FilterKey = "전체" | ChatLogFilterCategory;

const FILTERS: FilterKey[] = ["전체", "식비", "기타소비"];
const FILTER_LABEL: Record<FilterKey, string> = {
  전체: "전체",
  식비: "식비",
  기타소비: "기타 소비",
};

const handleNavChange = (key: NavBarItemKey) => {
  if (key === "chat") return;
  if (key === "home") {
    router.push("/");
    return;
  }
  if (key === "record") {
    router.push("/record");
    return;
  }
  if (key === "profile") {
    router.push("/mypage");
    return;
  }
  Alert.alert("준비 중", "아직 구현되지 않은 탭이에요.");
};

/**
 * 채팅 로그 목록 화면 (Figma "chat-log-list"). NavBar "채팅" 탭의 기본 진입 화면으로,
 * 채팅에서 확정된 소비 내역을 날짜별로 보여준다. "대화 하기"를 누르면 실시간 대화
 * 화면(`/chat/conversation`)으로 이동한다.
 */
export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("전체");

  const groups = useMemo(() => {
    const keyword = search.trim();
    return MOCK_LOG_GROUPS.map((group) => ({
      date: group.date,
      entries: group.entries.filter((entry) => {
        const matchesFilter = filter === "전체" || entry.filterCategory === filter;
        const matchesSearch =
          keyword.length === 0 ||
          entry.title.includes(keyword) ||
          String(entry.price).includes(keyword);
        return matchesFilter && matchesSearch;
      }),
    })).filter((group) => group.entries.length > 0);
  }, [search, filter]);

  if (!MOCK_HAS_ACTIVE_TRIP) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContent}>
          <EmptyTripPrompt
            onCreateTrip={() => router.push("/trip-create")}
            onLoadPastTrip={() =>
              Alert.alert("준비 중", "과거 여행 불러오기는 아직 준비 중이에요.")
            }
          />
        </View>
        <NavBar active="chat" onChange={handleNavChange} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <SectionHeader title="채팅" />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <TextField
          value={search}
          onChangeText={setSearch}
          placeholder="금액 및 매장 검색"
          leadingIcon={<Icon name="search" size="medium" />}
        />
        <View style={styles.filterRow}>
          {FILTERS.map((key) => (
            <Chip
              key={key}
              text={FILTER_LABEL[key]}
              active={filter === key}
              onPress={() => setFilter(key)}
            />
          ))}
        </View>
        {groups.length === 0 ? (
          <Text color="subtlest">표시할 소비 내역이 없어요.</Text>
        ) : (
          groups.map((group) => (
            <ChatLogList
              key={group.date}
              day={group.date}
              items={group.entries.map((entry) => ({
                id: entry.id,
                title: entry.title,
                time: entry.time,
                categoryLabel: entry.categoryLabel,
                price: formatWon(entry.price),
              }))}
            />
          ))
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Button label="대화 하기" onPress={() => router.push("/chat/conversation")} />
      </View>
      <View style={{ paddingBottom: insets.bottom }}>
        <NavBar active="chat" onChange={handleNavChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  emptyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[16],
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing[16],
    padding: spacing[16],
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing[6],
  },
  footer: {
    width: "100%",
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
  },
});
