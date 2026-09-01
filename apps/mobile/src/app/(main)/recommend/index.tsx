import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@apollo/client/react";
import {
  Button,
  EmptyTripPrompt,
  Icon,
  NavBar,
  RestaurantCard,
  SectionHeader,
  SegmentedControl,
  Text,
  colors,
  spacing,
  type NavBarItemKey,
} from "@repo/ui";
import { ActiveTripDocument, GoodPriceRestaurantsDocument, RegionNameDocument } from "@repo/types";

import { RecommendMapView, type RecommendMapMarker } from "@/components/RecommendMapView";
import { SortSheet, type SortOption } from "@/components/SortSheet";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { useSession } from "@/hooks/useSession";
import { formatWon } from "@/lib/format";
import {
  MEAL_TYPE_LABEL,
  findNextUnrecordedMealSlot,
  getRecommendBudgetAmount,
  type MealType,
} from "@/lib/budget";
import { getCheapestMenuPrice, parsePriceMenus } from "@/lib/restaurant";

// 위치 권한이 없거나 측위 실패 시 지도 초기 카메라로 쓸 최후 폴백(서울시청).
const FALLBACK_LOCATION = { latitude: 37.5665, longitude: 126.978 };

const DEFAULT_SORT_VALUE = "price-asc";
const SORT_OPTIONS: SortOption[] = [
  { value: DEFAULT_SORT_VALUE, label: "가격 낮은 순" },
  { value: "price-desc", label: "가격 높은 순" },
];

interface PriceListRestaurant {
  id: string;
  name: string;
  address: string;
  category: string;
  priceAmount: number;
  budgetPercent: number;
}

const sortByValue = (items: PriceListRestaurant[], sortValue: string) =>
  [...items].sort((a, b) =>
    sortValue === "price-desc"
      ? b.priceAmount - a.priceAmount
      : a.priceAmount - b.priceAmount,
  );

const handleNavChange = (key: NavBarItemKey) => {
  if (key === "recommend") return;
  if (key === "home") {
    router.push("/");
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
  if (key === "profile") {
    router.push("/mypage");
    return;
  }
};

/**
 * 추천 탭 "가격보기"(Figma "recommand-price", node 721:14702 / 733:15526) +
 * "지도보기"(Figma "recommand-map", node 733:15646 / 733:15879) 화면.
 */
export default function RecommendScreen() {
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<0 | 1>(0);
  const [sortValue, setSortValue] = useState(DEFAULT_SORT_VALUE);
  const [isSortSheetOpen, setSortSheetOpen] = useState(false);
  // 마커를 눌러야 선택되는 상태 — 지도보기 진입 시 기본값은 미선택(Preview 미표시)
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | undefined>(undefined);

  const { session } = useSession();
  const { data, loading, refetch: refetchActiveTrip } = useQuery(ActiveTripDocument, {
    variables: { userId: session?.user.id ?? "" },
    skip: !session,
    fetchPolicy: "cache-and-network",
  });
  const tripNode = data?.tripsCollection.edges[0]?.node;

  // 소비 기록 작성(record/new) 후 이 화면으로 돌아왔을 때 끼니 기록 여부가 바뀌어도
  // cache-and-network만으로는 재조회가 안 된다 — 포커스를 다시 받을 때마다 refetch해서
  // 추천 기준(끼니/예산)이 최신 상태를 반영하게 한다.
  useFocusEffect(
    useCallback(() => {
      refetchActiveTrip();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const mealSlots = (tripNode?.meal_slotsCollection?.edges ?? []).map((edge) => ({
    date: edge.node.date,
    mealType: edge.node.meal_type as MealType,
    budgetAmount: edge.node.budget_amount,
    carriedOverAmount: edge.node.carried_over_amount,
    isRecorded: edge.node.is_recorded,
  }));
  // F3-3: 가장 이른 미기록 끼니 슬롯을 추천 기준(끼니명 + 예산 상한)으로 삼는다.
  const nextMealSlot = findNextUnrecordedMealSlot(mealSlots);
  const mealBudgetAmount = nextMealSlot ? getRecommendBudgetAmount(nextMealSlot) : null;
  const sectionTitle = nextMealSlot
    ? viewMode === 0
      ? `${MEAL_TYPE_LABEL[nextMealSlot.mealType]} ${formatWon(mealBudgetAmount ?? 0)} 이하`
      : MEAL_TYPE_LABEL[nextMealSlot.mealType]
    : "기록할 끼니가 없어요";

  // F3-5: 여행의 region_code(예: "27") → restaurants.region_sido(예: "대구광역시")로
  // 변환해 착한가격업소 목록을 조회한다.
  const { data: regionData } = useQuery(RegionNameDocument, {
    variables: { code: tripNode?.region_code ?? "" },
    skip: !tripNode,
  });
  const regionSido = regionData?.region_cacheCollection.edges[0]?.node.region_name;

  const { data: restaurantsData, loading: restaurantsLoading } = useQuery(
    GoodPriceRestaurantsDocument,
    {
      variables: { regionSido: regionSido ?? "" },
      skip: !regionSido,
      fetchPolicy: "cache-and-network",
    },
  );
  // F3: 여행 지역의 착한가격업소 중 현재 끼니 예산 이하인 것만 추천 목록에 노출한다.
  const priceListRestaurants: PriceListRestaurant[] = mealBudgetAmount
    ? (restaurantsData?.restaurantsCollection.edges ?? [])
        .map((edge) => {
          const cheapestPrice = getCheapestMenuPrice(parsePriceMenus(edge.node.price_menus));
          if (cheapestPrice == null || cheapestPrice > mealBudgetAmount) return null;
          return {
            id: edge.node.id,
            name: edge.node.name,
            address: edge.node.address,
            category: edge.node.category ?? "",
            priceAmount: cheapestPrice,
            budgetPercent:
              mealBudgetAmount > 0 ? Math.round((cheapestPrice / mealBudgetAmount) * 100) : 0,
          };
        })
        .filter((item): item is PriceListRestaurant => item !== null)
    : [];

  const hasResults = priceListRestaurants.length > 0;
  const sortedRestaurants = sortByValue(priceListRestaurants, sortValue);
  const sortLabel = SORT_OPTIONS.find((option) => option.value === sortValue)?.label ?? "";

  // F3-1: 지도보기는 가격보기와 달리 예산과 무관하게, 좌표가 있는 착한가격업소를
  // 전부 마커로 띄운다 (좌표 없는 업소는 지오코딩 실패분이라 지도에 표시 불가).
  // TODO(F3-1 2단계): 일반 업소(source=tour_api) 마커는 아직 연동 전.
  const goodPriceMapMarkers: RecommendMapMarker[] = (restaurantsData?.restaurantsCollection.edges ?? [])
    .map((edge) => {
      // pg_graphql은 BigFloat(numeric 컬럼) 값을 정밀도 손실 방지를 위해 JSON
      // 문자열로 내려준다 — codegen 타입은 number라 적혀 있지만 실제로는
      // 문자열이라, 네이버 지도 네이티브 마커에 그대로 넘기면
      // "latitude cannot be cast from String to double" 오류가 난다.
      const latitude = Number(edge.node.latitude);
      const longitude = Number(edge.node.longitude);
      if (edge.node.latitude == null || edge.node.longitude == null) return null;
      if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;

      const cheapestPrice = getCheapestMenuPrice(parsePriceMenus(edge.node.price_menus));
      const marker: RecommendMapMarker = {
        id: edge.node.id,
        source: "good_price",
        name: edge.node.name,
        category: edge.node.category ?? "",
        // TODO(F3 후속): 사용자 실시간 위치 기반 거리 계산은 별도 스코프.
        distance: "-",
        price: cheapestPrice != null ? formatWon(cheapestPrice) : undefined,
        latitude,
        longitude,
      };
      return marker;
    })
    .filter((marker): marker is RecommendMapMarker => marker !== null);
  // 지도 초기 카메라는 마커 좌표가 아니라 사용자의 실제 현재 위치를 기준으로 삼는다
  // (권한 거부/측위 실패 시에만 FALLBACK_LOCATION으로 대체).
  const deviceLocation = useCurrentLocation();
  const mapCurrentLocation = deviceLocation ?? FALLBACK_LOCATION;

  if (loading && !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.emptyState}>
          <Text color="subtlest">여행 정보 불러오는 중...</Text>
        </View>
        <NavBar active="recommend" onChange={handleNavChange} />
      </View>
    );
  }

  // 홈 탭과 동일하게, 진행 중인 여행이 없으면 추천도 보여줄 수 없으므로 같은
  // 빈 상태(EmptyTripPrompt)로 유도한다.
  if (!tripNode) {
    return (
      <View style={styles.screen}>
        <View style={styles.emptyState}>
          <EmptyTripPrompt
            onCreateTrip={() => router.push("/trip-create")}
            onLoadPastTrip={() => Alert.alert("준비 중", "과거 여행 불러오기는 아직 준비 중이에요.")}
          />
        </View>
        <NavBar active="recommend" onChange={handleNavChange} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <SectionHeader
        title={sectionTitle}
        trailing={
          <View style={styles.segmentedControlSlot}>
            <SegmentedControl
              options={["가격보기", "지도보기"]}
              selectedIndex={viewMode}
              onChange={setViewMode}
            />
          </View>
        }
      />
      {viewMode === 0 ? (
        <>
          <View style={styles.introBlock}>
            <Text variant="footnoteRegular">
              가격으로 볼 후보, 착한 가격 업소만 정보를 제공하고 있어요.
            </Text>
            <View style={styles.sortRow}>
              <Text variant="subheadlineEmphasized">조건에 맞는 곳 {priceListRestaurants.length}</Text>
              <Pressable style={styles.sort} onPress={() => setSortSheetOpen(true)}>
                <Text variant="subheadlineEmphasized">{sortLabel}</Text>
                <Icon name="chevron-down" size="medium" />
              </Pressable>
            </View>
          </View>
          {restaurantsLoading && !restaurantsData ? (
            <View style={styles.emptyState}>
              <Text color="subtlest">음식점 불러오는 중...</Text>
            </View>
          ) : hasResults ? (
            <FlatList
              data={sortedRestaurants}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <RestaurantCard
                  name={item.name}
                  price={formatWon(item.priceAmount)}
                  address={item.address}
                  category={item.category}
                  budgetLabel={`예산 ${item.budgetPercent}%`}
                  onPress={() => router.push(`/recommend/${item.id}`)}
                />
              )}
            />
          ) : (
            <>
              <View style={styles.emptyState}>
                <Text variant="title3Emphasized" align="center">
                  추천 가능한 음식점이 없어요
                </Text>
                <Text variant="bodyRegular" color="subtle" align="center">
                  예산을 수정하고 다시 추천을 받아보세요
                </Text>
              </View>
              <View style={styles.budgetAdjustBlock}>
                <Button
                  label="예산 조정"
                  variant="primary"
                  onPress={() => router.push("/budget-edit")}
                />
              </View>
            </>
          )}
        </>
      ) : (
        <RecommendMapView
          markers={goodPriceMapMarkers}
          currentLocation={mapCurrentLocation}
          selectedMarkerId={selectedMarkerId}
          onSelectMarker={setSelectedMarkerId}
          onPressDetail={() => {
            if (!selectedMarkerId) return;
            router.push(`/recommend/${selectedMarkerId}`);
          }}
        />
      )}
      <View style={{ paddingBottom: insets.bottom }}>
        <NavBar active="recommend" onChange={handleNavChange} />
      </View>
      <SortSheet
        visible={isSortSheetOpen}
        options={SORT_OPTIONS}
        selectedValue={sortValue}
        onSelect={setSortValue}
        onClose={() => setSortSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  segmentedControlSlot: {
    width: 164,
    height: 34,
  },
  introBlock: {
    width: "100%",
    gap: spacing[16],
    paddingTop: spacing[24],
    paddingHorizontal: spacing[16],
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  sort: {
    flexDirection: "row",
    alignItems: "center",
  },
  list: {
    gap: spacing[12],
    paddingTop: spacing[8],
    paddingBottom: spacing[12],
    paddingHorizontal: spacing[16],
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[16],
  },
  budgetAdjustBlock: {
    width: "100%",
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
  },
});
