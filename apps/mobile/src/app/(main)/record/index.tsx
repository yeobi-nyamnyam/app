import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@apollo/client/react";
import {
  CTACard,
  EmptyTripPrompt,
  NavBar,
  RecordCard,
  Text,
  UnderlineTabs,
  colors,
  spacing,
  type NavBarItemKey,
} from "@repo/ui";
import { ActiveTripDocument, UserTripsDocument } from "@repo/types";

import { useSession } from "@/hooks/useSession";

const TABS = ["기록 작성하기", "기록보기"];

/**
 * 기록 탭 진입 화면 (Figma "write"/"trip-list"). 소비 기록/여행 일기 작성 진입점 +
 * 기록보기 탭. 일기(D0~D3)는 기록 기능 개발이 끝난 뒤 별도로 작업하므로 여기서는
 * 진입 버튼만 둔다. "기록보기"(F6-8)는 여행 목록을 진행 중/완료됨으로 묶어 보여주고,
 * 항목을 누르면 그 여행의 소비 기록 목록(`record/history.tsx`, F6-9)으로 이동한다.
 */
export default function RecordWriteScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);
  const { session } = useSession();
  const userId = session?.user.id ?? "";

  const { data, loading, refetch: refetchActiveTrip } = useQuery(ActiveTripDocument, {
    variables: { userId },
    skip: !session,
    fetchPolicy: "cache-and-network",
  });
  const tripId = data?.tripsCollection.edges[0]?.node.id;

  const {
    data: tripsData,
    loading: tripsLoading,
    refetch: refetchTrips,
  } = useQuery(UserTripsDocument, {
    variables: { userId },
    skip: !session,
    fetchPolicy: "cache-and-network",
  });

  // record/new, record/edit에서 저장/삭제 후 돌아왔을 때 이 화면이 그대로 마운트되어
  // 있어서 cache-and-network만으로는 재조회가 안 된다 — 포커스를 다시 받을 때마다
  // 명시적으로 refetch한다.
  useFocusEffect(
    useCallback(() => {
      refetchActiveTrip();
      refetchTrips();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const trips = (tripsData?.tripsCollection.edges ?? []).map((edge) => edge.node);
  const ongoingTrips = trips.filter((trip) => trip.status !== "completed");
  const completedTrips = trips.filter((trip) => trip.status === "completed");

  const handleRecordPress = () => router.push(`/record/new?tripId=${tripId}`);
  const handleDiaryPress = () => router.push(`/diary/write?tripId=${tripId}`);

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

  const goToTripHistory = (tripHistoryId: string, tripName: string) =>
    router.push({
      pathname: "/record/history",
      params: { tripId: tripHistoryId, tripName },
    });

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
              onPress={handleDiaryPress}
            />
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <EmptyTripPrompt onCreateTrip={() => router.push("/trip-create")} />
          </View>
        )
      ) : tripsLoading && !tripsData ? (
        <View style={styles.emptyState}>
          <Text color="subtlest">여행 목록 불러오는 중...</Text>
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.emptyState}>
          <Text color="subtlest">아직 여행이 없어요.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {ongoingTrips.length > 0 ? (
            <View style={styles.section}>
              <Text variant="title3Emphasized">진행 중</Text>
              {ongoingTrips.map((trip) => (
                <RecordCard
                  key={trip.id}
                  title={trip.name}
                  period={`${trip.start_date} - ${trip.end_date}`}
                  showBudget={false}
                  onPress={() => goToTripHistory(trip.id, trip.name)}
                />
              ))}
            </View>
          ) : null}

          {completedTrips.length > 0 ? (
            <View style={styles.section}>
              <Text variant="title3Emphasized">완료됨</Text>
              {completedTrips.map((trip) => (
                <RecordCard
                  key={trip.id}
                  title={trip.name}
                  period={`${trip.start_date} - ${trip.end_date}`}
                  showBudget={false}
                  onPress={() => goToTripHistory(trip.id, trip.name)}
                />
              ))}
            </View>
          ) : null}
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
