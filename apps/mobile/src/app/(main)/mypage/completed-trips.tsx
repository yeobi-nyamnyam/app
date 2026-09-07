import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@apollo/client/react";
import {
  Header,
  Icon,
  NavBar,
  Text,
  TextField,
  TripSummaryCard,
  colors,
  spacing,
  type NavBarItemKey,
} from "@repo/ui";
import { CompletedTripsDocument } from "@repo/types";

import { useSession } from "@/hooks/useSession";
import { useAlertModal } from "@/hooks/useAlertModal";
import { formatTripPeriod } from "@/lib/format";

// 완료 여행 목록 (Figma node 410:2278, "User_5 - 완료 여행"). Figma 원본은 뒤로가기
// 없는 굵은 타이틀이지만, 다른 마이페이지 하위 화면과의 일관성을 위해 공용
// Header 컴포넌트(뒤로가기 포함)로 통일한다(사용자 확인 완료).
export default function CompletedTripsScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const { showAlert } = useAlertModal();
  const [query, setQuery] = useState("");

  const { data, loading } = useQuery(CompletedTripsDocument, {
    variables: { userId: session?.user.id ?? "" },
    skip: !session,
    fetchPolicy: "cache-and-network",
  });

  const regionNameByCode = new Map(
    (data?.region_cacheCollection.edges ?? []).map((edge) => [edge.node.region_code, edge.node.region_name]),
  );

  const completedTrips = useMemo(() => {
    const trips = (data?.tripsCollection.edges ?? [])
      .map((edge) => edge.node)
      .filter((trip) => trip.status === "completed");
    const trimmedQuery = query.trim();
    return trimmedQuery
      ? trips.filter((trip) => trip.name.includes(trimmedQuery))
      : trips;
  }, [data, query]);

  const handleNavChange = (key: NavBarItemKey) => {
    if (key === "profile") {
      router.push("/mypage");
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
    if (key === "record") {
      router.push("/record");
      return;
    }
    showAlert("준비 중", "아직 구현되지 않은 탭이에요.");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="완료 여행" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <TextField
          value={query}
          onChangeText={setQuery}
          placeholder="여행 검색"
          leadingIcon={<Icon name="search" size="small" color={colors.content.neutral.subtlest} />}
        />

        {loading && !data ? (
          <Text color="subtlest">여행 정보를 불러오는 중...</Text>
        ) : (
          <>
            <Text variant="footnoteEmphasized">지난 여행</Text>
            {completedTrips.length === 0 ? (
              <Text color="subtlest" align="center">
                {query.trim() ? "검색 결과가 없어요." : "완료된 여행이 아직 없어요."}
              </Text>
            ) : (
              <View style={styles.tripList}>
                {completedTrips.map((trip) => {
                  const consumed = (trip.meal_logsCollection?.edges ?? []).reduce(
                    (sum, edge) => sum + edge.node.amount,
                    0,
                  );
                  const ratio =
                    trip.total_budget > 0 ? Math.round((consumed / trip.total_budget) * 100) : 0;
                  const withinBudget = ratio <= 100;
                  const regionName = regionNameByCode.get(trip.region_code) ?? trip.region_code;
                  return (
                    <TripSummaryCard
                      key={trip.id}
                      title={trip.name}
                      subtitle={`${formatTripPeriod(trip.start_date, trip.end_date)} · ${regionName}`}
                      ratioLabel={`${ratio}%`}
                      tagLabel={withinBudget ? "예산 준수" : "소폭 초과"}
                      tagVariant={withinBudget ? "success" : "warning"}
                    />
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
      <NavBar active="profile" onChange={handleNavChange} bottomInset={insets.bottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  content: {
    gap: spacing[14],
    padding: spacing[16],
  },
  tripList: {
    gap: spacing[10],
  },
});
