import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
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
import {
  ActiveTripDocument,
  GoodPriceRestaurantsByPriceAscDocument,
  GoodPriceRestaurantsByPriceDescDocument,
  GoodPriceRestaurantsDocument,
  RegionNameDocument,
  TourApiRestaurantsDocument,
} from "@repo/types";

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
import { getCheapestMenuPrice, parseCoordinate, parsePriceMenus } from "@/lib/restaurant";

// 위치 권한이 없거나 측위 실패 시 지도 초기 카메라로 쓸 최후 폴백(서울시청).
const FALLBACK_LOCATION = { latitude: 37.5665, longitude: 126.978 };

const DEFAULT_SORT_VALUE = "price-asc";
// F3-6: 가격보기 리스트를 서버 커서 페이지네이션으로 이 개수 단위씩 받아온다.
// (F3-4 때는 클라이언트가 지역 전체를 받아 렌더링만 나눴는데, min_price 실컬럼을
// 서버 측 filter/orderBy 대상으로 쓸 수 있게 되면서 네트워크 자체를 페이지 단위로
// 나눌 수 있게 됐다 — 초기 로딩/트래픽이 더 이상 지역 전체 크기에 비례하지 않는다.)
const PAGE_SIZE = 30;
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

  // F3-6: 지도보기 전용 조회 — 가격보기와 달리 예산과 무관하게 좌표 있는 착한가격업소를
  // 전부 마커로 띄워야 해서, min_price 필터/페이지네이션을 쓰는 가격보기 쿼리와는
  // 분리했다. TourApi와 같은 이유로 지도보기(viewMode===1)에서만 조회한다.
  const { data: restaurantsData } = useQuery(GoodPriceRestaurantsDocument, {
    variables: { regionSido: regionSido ?? "" },
    skip: !regionSido || viewMode !== 1,
    fetchPolicy: "cache-and-network",
  });

  // F3-6: 가격보기 전용 조회 — restaurants.min_price(실컬럼)를 서버 측
  // filter(예산 이하)/orderBy(가격순)에 써서 first+after 커서 페이지네이션으로
  // 받아온다. price_menus(jsonb) 기준으로는 pg_graphql이 서버 측 정렬/필터를
  // 지원하지 않아(good-price-restaurants.query.graphql 주석 참고) min_price
  // 컬럼을 새로 추가해 해결했다 — 이제 지역 전체가 아니라 페이지 단위로만 받는다.
  // 정렬 방향별로 쿼리를 분리한 이유는 쿼리 파일 주석 참고(orderBy 변수화 시
  // codegen이 타입을 중복 생성해 tsc가 깨지는 문제).
  const pricedDocument =
    sortValue === "price-desc"
      ? GoodPriceRestaurantsByPriceDescDocument
      : GoodPriceRestaurantsByPriceAscDocument;
  const {
    data: pricedData,
    loading: pricedLoading,
    fetchMore: fetchMorePriced,
  } = useQuery(pricedDocument, {
    variables: {
      regionSido: regionSido ?? "",
      maxPrice: String(mealBudgetAmount ?? 0),
      first: PAGE_SIZE,
    },
    skip: !regionSido || !mealBudgetAmount,
    fetchPolicy: "cache-and-network",
  });

  const pricedEdges = pricedData?.restaurantsCollection.edges;
  const priceListRestaurants: PriceListRestaurant[] = useMemo(() => {
    if (!mealBudgetAmount) return [];
    return (pricedEdges ?? []).map((edge) => {
      const priceAmount = edge.node.min_price ?? 0;
      return {
        id: edge.node.id,
        name: edge.node.name,
        address: edge.node.address,
        category: edge.node.category ?? "",
        priceAmount,
        budgetPercent:
          mealBudgetAmount > 0 ? Math.round((priceAmount / mealBudgetAmount) * 100) : 0,
      };
    });
  }, [pricedEdges, mealBudgetAmount]);

  const hasResults = priceListRestaurants.length > 0;
  // totalCount는 서버 측 필터(예산 이하) 기준 전체 개수 — 지금 받아온 페이지 수와 무관하다.
  const totalMatchingCount =
    pricedData?.restaurantsCollection.totalCount ?? priceListRestaurants.length;
  const sortLabel = SORT_OPTIONS.find((option) => option.value === sortValue)?.label ?? "";

  // F3-6: 무한 스크롤 — FlatList가 끝에 닿을 때마다 다음 페이지를 실제로 네트워크
  // 요청한다(fetchMore). 이미 다음 페이지를 요청 중이거나 더 없으면 무시.
  //
  // isFetchingMore(state)만으로 막으면, 빠르게 스크롤할 때 onEndReached가 같은
  // 렌더 사이클 안에서 연달아 여러 번 불려도 그 클로저들은 아직 false였던 state를
  // 그대로 참조해서 같은 cursor로 fetchMore가 중복 호출된다 — 그 결과 같은 페이지가
  // 두 번 이어붙어 FlatList 리스트에 id가 중복되는 버그로 나타났다(실기기 확인).
  // ref는 리렌더를 기다리지 않고 즉시 최신값을 반영하므로 이 재진입을 막는다.
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const isFetchingMoreRef = useRef(false);
  const pricedPageInfo = pricedData?.restaurantsCollection.pageInfo;
  const handleEndReached = useCallback(() => {
    if (!pricedPageInfo?.hasNextPage || isFetchingMoreRef.current) return;
    isFetchingMoreRef.current = true;
    setIsFetchingMore(true);
    fetchMorePriced({
      variables: { after: pricedPageInfo.endCursor },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          restaurantsCollection: {
            ...fetchMoreResult.restaurantsCollection,
            edges: [
              ...prev.restaurantsCollection.edges,
              ...fetchMoreResult.restaurantsCollection.edges,
            ],
          },
        };
      },
    }).finally(() => {
      isFetchingMoreRef.current = false;
      setIsFetchingMore(false);
    });
  }, [pricedPageInfo, fetchMorePriced]);

  // F3-1: 지도보기는 가격보기와 달리 예산과 무관하게, 좌표가 있는 착한가격업소를
  // 전부 마커로 띄운다 (좌표 없는 업소는 지오코딩 실패분이라 지도에 표시 불가).
  // GraphQL edges 배열 자체를 의존성으로 잡아 useMemo — 매 렌더마다 새 배열을
  // 만들면 RecommendMapView 안의 클러스터링 인덱스가 선택 상태 변경 등 무관한
  // 렌더에도 통째로 재생성돼(수천 건 기준 눈에 띄는 랙) 마커 클릭/줌 반응이 느려진다.
  const goodPriceEdges = restaurantsData?.restaurantsCollection.edges;
  const goodPriceMapMarkers: RecommendMapMarker[] = useMemo(
    () =>
      (goodPriceEdges ?? [])
        .map((edge) => {
          const latitude = parseCoordinate(edge.node.latitude);
          const longitude = parseCoordinate(edge.node.longitude);
          if (latitude == null || longitude == null) return null;

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
        .filter((marker): marker is RecommendMapMarker => marker !== null),
    [goodPriceEdges],
  );

  // F3-1 2단계: 일반 업소(source=tour_api, TourAPI contentTypeId=39)도 가격과
  // 무관하게 좌표가 있는 것 전부 마커로 띄운다. 지도보기(viewMode===1)에서만
  // 쓰는 데이터라 가격보기에서까지 불필요하게 조회하지 않도록 skip한다.
  const { data: tourApiData } = useQuery(TourApiRestaurantsDocument, {
    variables: { regionSido: regionSido ?? "" },
    skip: !regionSido || viewMode !== 1,
    fetchPolicy: "cache-and-network",
  });
  const tourApiEdges = tourApiData?.restaurantsCollection.edges;
  const tourApiMapMarkers: RecommendMapMarker[] = useMemo(
    () =>
      (tourApiEdges ?? [])
        .map((edge) => {
          const latitude = parseCoordinate(edge.node.latitude);
          const longitude = parseCoordinate(edge.node.longitude);
          if (latitude == null || longitude == null) return null;

          const marker: RecommendMapMarker = {
            id: edge.node.id,
            source: "tour_api",
            name: edge.node.name,
            category: edge.node.category ?? "",
            distance: "-",
            imageUrl: edge.node.image_url ?? undefined,
            latitude,
            longitude,
          };
          return marker;
        })
        .filter((marker): marker is RecommendMapMarker => marker !== null),
    [tourApiEdges],
  );

  const mapMarkers = useMemo(
    () => [...goodPriceMapMarkers, ...tourApiMapMarkers],
    [goodPriceMapMarkers, tourApiMapMarkers],
  );

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
        <NavBar active="recommend" onChange={handleNavChange} bottomInset={insets.bottom} />
      </View>
    );
  }

  // 홈 탭과 동일하게, 진행 중인 여행이 없으면 추천도 보여줄 수 없으므로 같은
  // 빈 상태(EmptyTripPrompt)로 유도한다.
  if (!tripNode) {
    return (
      <View style={styles.screen}>
        <View style={styles.emptyState}>
          <EmptyTripPrompt onCreateTrip={() => router.push("/trip-create")} />
        </View>
        <NavBar active="recommend" onChange={handleNavChange} bottomInset={insets.bottom} />
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
              <Text variant="subheadlineEmphasized">조건에 맞는 곳 {totalMatchingCount}</Text>
              <Pressable style={styles.sort} onPress={() => setSortSheetOpen(true)}>
                <Text variant="subheadlineEmphasized">{sortLabel}</Text>
                <Icon name="chevron-down" size="medium" />
              </Pressable>
            </View>
          </View>
          {pricedLoading && !pricedData ? (
            <View style={styles.emptyState}>
              <Text color="subtlest">음식점 불러오는 중...</Text>
            </View>
          ) : hasResults ? (
            <FlatList
              data={priceListRestaurants}
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
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              initialNumToRender={PAGE_SIZE}
              maxToRenderPerBatch={PAGE_SIZE}
              windowSize={7}
              ListFooterComponent={
                isFetchingMore ? (
                  <Text color="subtlest" align="center">
                    더 불러오는 중...
                  </Text>
                ) : null
              }
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
          markers={mapMarkers}
          currentLocation={mapCurrentLocation}
          selectedMarkerId={selectedMarkerId}
          onSelectMarker={setSelectedMarkerId}
          onPressDetail={() => {
            if (!selectedMarkerId) return;
            router.push(`/recommend/${selectedMarkerId}`);
          }}
        />
      )}
      <NavBar active="recommend" onChange={handleNavChange} bottomInset={insets.bottom} />
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
