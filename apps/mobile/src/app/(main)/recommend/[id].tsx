import { useCallback, useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useQuery } from "@apollo/client/react";
import { Text } from "@repo/ui";
import { ActiveTripDocument, RestaurantByIdDocument } from "@repo/types";

import {
  RestaurantDetailView,
  type RestaurantDetailBudgetSummary,
  type RestaurantDetailData,
  type RestaurantDetailSource,
} from "@/components/RestaurantDetailView";
import { useSession } from "@/hooks/useSession";
import {
  MEAL_TYPE_LABEL,
  findNextUnrecordedMealSlot,
  getRecommendBudgetAmount,
  type MealType,
} from "@/lib/budget";
import { formatWon } from "@/lib/format";
import { fetchRestaurantDetail, type RestaurantDetailFromApi } from "@/lib/recommend";
import { getCheapestMenuPrice, parsePriceMenus } from "@/lib/restaurant";

const parsePrice = (price: string) => Number(price.replace(/[^0-9]/g, ""));

// F3-3: 추천 기준 예산 상한(mealBudgetAmount) 대비 대표 메뉴 가격의 비율/잔여 예산.
const toBudgetSummary = (
  price: string,
  mealType: MealType,
  mealBudgetAmount: number,
): RestaurantDetailBudgetSummary => {
  const priceNumber = parsePrice(price);
  const remaining = mealBudgetAmount - priceNumber;
  return {
    price,
    mealName: MEAL_TYPE_LABEL[mealType],
    budgetPercent: mealBudgetAmount > 0 ? Math.round((priceNumber / mealBudgetAmount) * 100) : 0,
    remainingLabel: `${remaining.toLocaleString("ko-KR")}원`,
  };
};

// good_price 업소(대표 메뉴 가격)만 값이 있음 — F3-3 예산 대비 비율 계산에 사용.
const MOCK_RESTAURANT_PRICES: Record<string, string> = {
  m1: "6,500원",
  m2: "15,000원",
};

// TODO(F3-1 데이터 연동): 지도보기(m1~m4)는 이번 F3-5 범위에서 제외해 mock 유지
// (Figma "cuisine-detail (good-price)" node 733:15941, "cuisine-detail (common)"
// node 733:16596 예시 그대로). 가격보기(실제 restaurants UUID)는 아래에서
// RestaurantByIdDocument로 실 데이터를 조회한다.
const MOCK_RESTAURANT_DETAILS: Record<string, Omit<RestaurantDetailData, "budgetSummary">> = {
  m1: {
    id: "m1",
    source: "good_price",
    name: "대명돼지국밥",
    category: "한식",
    distance: "0.5km",
    phone: "053-123-4567",
    address: "대구광역시 북구 호국로43길 27-12",
    menu: [
      { name: "돼지국밥", price: "6,500원" },
      { name: "순대국밥", price: "6,500원" },
      { name: "특국밥", price: "8,000원" },
      { name: "머리고기국밥", price: "7,000원" },
      { name: "내장국밥", price: "7,000원" },
      { name: "섞어국밥", price: "7,500원" },
      { name: "수육 (소)", price: "13,000원" },
      { name: "수육 (대)", price: "20,000원" },
      { name: "순대접시", price: "9,000원" },
      { name: "머리고기접시", price: "10,000원" },
      { name: "공기밥", price: "1,000원" },
      { name: "소주", price: "5,000원" },
      { name: "맥주", price: "5,000원" },
    ],
  },
  m2: {
    id: "m2",
    source: "good_price",
    name: "윤소인남산고단백장어죽집",
    category: "한식",
    distance: "0.8km",
    phone: "053-234-5678",
    address: "대구광역시 중구 동성로 19-11",
    menu: [
      { name: "장어덮밥", price: "15,000원" },
      { name: "장어구이", price: "20,000원" },
    ],
  },
  m3: {
    id: "m3",
    source: "tour_api",
    name: "가마솥 순대국밥",
    category: "한식",
    distance: "0.1km",
    phone: "051-123-4567",
    address: "서면로 12번길 8",
    hours: "08:00 - 21:00",
    holiday: "매주 일요일 / 설, 추석 연휴",
    menu: [{ name: "순대국밥" }, { name: "특순대국밥" }, { name: "수육 (소)" }],
  },
  m4: {
    id: "m4",
    source: "tour_api",
    name: "둔산식당",
    category: "한식",
    distance: "0.6km",
    phone: "042-345-6789",
    address: "약수동 약수로 20",
    hours: "11:00 - 20:00",
    holiday: "매주 월요일",
    menu: [{ name: "제육볶음" }, { name: "김치찌개" }],
  },
};

/**
 * 추천 탭 음식점 상세 화면. 가격보기 `RestaurantCard`(항상 착한가격업소)와
 * 지도보기 `Preview`의 "상세 보기"(착한가격업소·일반업소 둘 다 가능) 양쪽에서
 * 진입하며, `id`로 조회한 데이터의 `source`에 따라 화면이 분기된다
 * (Figma "cuisine-detail (good-price)" / "cuisine-detail (common)").
 */
export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mockDetail = id ? MOCK_RESTAURANT_DETAILS[id] : undefined;
  const mockPrice = id ? MOCK_RESTAURANT_PRICES[id] : undefined;

  // F3-5: 가격보기는 이제 실제 restaurants UUID를 넘기므로, mock에 없는 id는
  // 실 데이터로 조회한다 (지도보기의 m1~m4 mock id만 위 MOCK_RESTAURANT_DETAILS로 처리).
  const { data: restaurantData, loading: restaurantLoading } = useQuery(RestaurantByIdDocument, {
    variables: { id: id ?? "" },
    skip: !id || !!mockDetail,
  });
  const restaurantNode = restaurantData?.restaurantsCollection.edges[0]?.node;

  // F3-2: 일반 업소(tour_api)의 영업시간/휴일은 목록에 없어 상세 진입 시에만
  // 서버 경유로 지연 로딩한다 (서버가 24시간 캐시).
  const [tourApiDetail, setTourApiDetail] = useState<RestaurantDetailFromApi | null>(null);
  const restaurantNodeId = restaurantNode?.id;
  const restaurantNodeSource = restaurantNode?.source;
  useEffect(() => {
    if (!restaurantNodeId || restaurantNodeSource !== "tour_api") {
      setTourApiDetail(null);
      return;
    }
    let cancelled = false;
    fetchRestaurantDetail(restaurantNodeId)
      .then((detail) => {
        if (!cancelled) setTourApiDetail(detail);
      })
      .catch(() => {
        // 영업시간/휴일 없이도 나머지 정보는 그대로 보여준다.
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantNodeId, restaurantNodeSource]);

  const { session } = useSession();
  const { data, refetch: refetchActiveTrip } = useQuery(ActiveTripDocument, {
    variables: { userId: session?.user.id ?? "" },
    skip: !session,
    fetchPolicy: "cache-and-network",
  });
  const tripNode = data?.tripsCollection.edges[0]?.node;
  const tripId = tripNode?.id;

  // 소비 기록 작성(record/new)에서 저장하고 돌아왔을 때, 예산 요약(budgetSummary)이
  // 방금 기록한 끼니 기준으로 남아있지 않도록 포커스를 다시 받을 때마다 refetch한다.
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
  // F3-3: 가격보기와 동일하게 가장 이른 미기록 끼니 슬롯을 예산 상한 기준으로 삼는다.
  const nextMealSlot = findNextUnrecordedMealSlot(mealSlots);

  const detailFromRestaurant: Omit<RestaurantDetailData, "budgetSummary"> | undefined =
    restaurantNode
      ? {
          id: restaurantNode.id,
          source: restaurantNode.source as RestaurantDetailSource,
          name: restaurantNode.name,
          category: restaurantNode.category ?? "",
          // TODO(F3 후속): 사용자 실시간 위치 기반 거리 계산은 별도 스코프.
          distance: "-",
          phone: tourApiDetail?.phone ?? restaurantNode.phone ?? "-",
          address: restaurantNode.address,
          imageUrl: restaurantNode.image_url ?? undefined,
          hours: tourApiDetail?.businessHours ?? undefined,
          holiday: tourApiDetail?.holiday ?? undefined,
          menu: parsePriceMenus(restaurantNode.price_menus).map((menuItem) => ({
            name: menuItem.name,
            price: formatWon(menuItem.price),
          })),
        }
      : undefined;
  const restaurantCheapestPrice = restaurantNode
    ? getCheapestMenuPrice(parsePriceMenus(restaurantNode.price_menus))
    : null;
  const restaurantPrice =
    mockPrice ?? (restaurantCheapestPrice != null ? formatWon(restaurantCheapestPrice) : undefined);

  const baseDetail = mockDetail ?? detailFromRestaurant;
  const restaurant: RestaurantDetailData | undefined = baseDetail
    ? {
        ...baseDetail,
        budgetSummary:
          restaurantPrice && nextMealSlot
            ? toBudgetSummary(restaurantPrice, nextMealSlot.mealType, getRecommendBudgetAmount(nextMealSlot))
            : undefined,
      }
    : undefined;

  if (!restaurant) {
    if (restaurantLoading) {
      return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text variant="bodyRegular" color="subtle">
            불러오는 중...
          </Text>
        </View>
      );
    }
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text variant="bodyRegular" color="subtle">
          음식점을 찾을 수 없어요
        </Text>
      </View>
    );
  }

  const handlePressCTA = () => {
    if (!tripId) {
      Alert.alert("진행 중인 여행이 없어요", "여행을 먼저 만들어주세요.");
      return;
    }
    const params = new URLSearchParams({
      tripId,
      source: "recommend",
      presetCategory: "식비",
      presetStoreName: restaurant.name,
      presetStoreAddress: restaurant.address,
    });
    if (restaurant.budgetSummary) {
      params.set("presetAmount", String(parsePrice(restaurant.budgetSummary.price)));
    }
    // F3-2/F3-3: 가격/예산 계산과 동일한 기준(가장 이른 미기록 끼니)의 날짜·끼니때를
    // 방문 날짜/끼니 때 초깃값으로 그대로 넘긴다.
    if (nextMealSlot) {
      params.set("presetVisitDate", nextMealSlot.date);
      params.set("presetMealType", nextMealSlot.mealType);
    }
    router.push(`/record/new?${params.toString()}`);
  };

  return (
    <RestaurantDetailView
      restaurant={restaurant}
      onBackPress={() => router.back()}
      onPressCTA={handlePressCTA}
    />
  );
}
