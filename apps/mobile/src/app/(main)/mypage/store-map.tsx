import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@apollo/client/react";
import { Badge, Header, NavBar, Text, colors, radius, spacing, stroke, type NavBarItemKey } from "@repo/ui";
import { VisitedStoresDocument } from "@repo/types";

import { useSession } from "@/hooks/useSession";
import { useAlertModal } from "@/hooks/useAlertModal";
import { formatMonthDay, formatWon } from "@/lib/format";
import { buildVisitedStoreGroups, type MealLogInput } from "@/lib/visitedStores";
import { VisitedStoreMapView, VISIT_DOT_COLOR, REVISIT_DOT_COLOR } from "@/components/VisitedStoreMapView";

/**
 * 방문 매장 지도 (M2, Figma "User_6 - 방문 매장 지도 (발자국)", node 409:2247).
 * 사용자의 전체 여행에 걸친 식비 기록(`meal_logs.category === '식비'`) 중
 * 좌표가 있는 것만 매장 단위로 그룹핑해 지도 마커 + 목록으로 보여준다
 * (그룹핑 규칙은 business-logic-notes.md §10, `lib/visitedStores.ts` 참고).
 *
 * Figma 헤더의 "목록" 텍스트는 이 화면에 대응하는 별도 목록 전용 화면이
 * Figma에 없어(get_metadata로 확인) 정적 라벨로만 두고, 아래 매장 목록은
 * 지도 아래 고정 위치에 항상 보이는 형태로 구현했다.
 */
export default function StoreMapScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const { showAlert } = useAlertModal();

  const { data, loading } = useQuery(VisitedStoresDocument, {
    variables: { userId: session?.user.id ?? "" },
    skip: !session,
    fetchPolicy: "cache-and-network",
  });

  const visitedStores = useMemo(() => {
    const mealLogs: MealLogInput[] = (data?.tripsCollection.edges ?? []).flatMap((tripEdge) =>
      (tripEdge.node.meal_logsCollection?.edges ?? [])
        .filter((logEdge) => logEdge.node.category === "식비")
        .map((logEdge) => ({
          storeName: logEdge.node.store_name,
          storeAddress: logEdge.node.store_address,
          storeLatitude: logEdge.node.store_latitude,
          storeLongitude: logEdge.node.store_longitude,
          restaurantId: logEdge.node.restaurant_id,
          amount: logEdge.node.amount,
          visitDate: logEdge.node.visit_date,
        })),
    );
    return buildVisitedStoreGroups(mealLogs);
  }, [data]);

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
      <Header title="방문 매장 지도" onBackPress={() => router.back()} tailing="text" tailingText="목록" />
      <View style={styles.body}>
        <View style={styles.mapArea}>
          <VisitedStoreMapView
            stores={visitedStores.map((store) => ({
              id: store.key,
              latitude: store.latitude,
              longitude: store.longitude,
              isRevisit: store.isRevisit,
            }))}
          />
        </View>
        <ScrollView contentContainerStyle={styles.listContent}>
          <View style={styles.listHeader}>
            <Text variant="bodyEmphasized">발자국 {visitedStores.length}</Text>
            <Text variant="footnoteRegular" color="subtle">
              최근순
            </Text>
          </View>
          {loading && !data ? (
            <Text color="subtlest">방문 매장을 불러오는 중...</Text>
          ) : visitedStores.length === 0 ? (
            <Text color="subtlest" align="center">
              아직 좌표가 있는 방문 기록이 없어요.
            </Text>
          ) : (
            <View style={styles.storeList}>
              {visitedStores.map((store) => (
                <View key={store.key} style={styles.storeRow}>
                  <View
                    style={[
                      styles.storeDot,
                      { backgroundColor: store.isRevisit ? REVISIT_DOT_COLOR : VISIT_DOT_COLOR },
                    ]}
                  />
                  <View style={styles.storeCol}>
                    <View style={styles.storeNameRow}>
                      <Text variant="subheadlineEmphasized" numberOfLines={1}>
                        {store.storeName}
                      </Text>
                      {store.isRevisit ? <Badge label={`${store.visitCount}회 방문`} variant="warning" /> : null}
                    </View>
                    {/* Figma는 "서면"/"남포동" 같은 동 단위 축약 지역명을 쓰지만,
                        주소 문자열에서 동 단위를 뽑아내는 파싱 유틸이 아직 없어
                        (docs/business-logic-notes.md에도 규칙 없음) 전체 주소를
                        그대로 쓴다 — 필요해지면 별도 유틸 추가 검토. */}
                    <Text variant="footnoteRegular" color="subtle" numberOfLines={1}>
                      {store.storeAddress} · {store.visitDates.map(formatMonthDay).join(", ")}
                    </Text>
                  </View>
                  <Text variant="subheadlineEmphasized">{formatWon(store.totalAmount)}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
      <NavBar active="profile" onChange={handleNavChange} bottomInset={insets.bottom} />
    </View>
  );
}

const MAP_AREA_HEIGHT = 260;
// Figma Store Row 모서리는 14px — packages/tokens radius 스케일(10/16/20/23...)에
// 없는 값이라 근사치(16) 대신 실측값을 로컬 상수로 둔다.
const STORE_ROW_RADIUS = 14;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  body: {
    flex: 1,
  },
  mapArea: {
    height: MAP_AREA_HEIGHT,
    overflow: "hidden",
  },
  listContent: {
    padding: spacing[16],
    gap: spacing[12],
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[12],
  },
  storeList: {
    gap: spacing[12],
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[12],
    paddingHorizontal: spacing[14],
    paddingVertical: spacing[12],
    borderRadius: STORE_ROW_RADIUS,
    borderWidth: stroke.hairline,
    borderColor: colors.border.neutral.subtle,
    backgroundColor: colors.surface.neutral.default,
  },
  storeDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  storeCol: {
    flex: 1,
    gap: spacing[2],
  },
  storeNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[6],
  },
});
