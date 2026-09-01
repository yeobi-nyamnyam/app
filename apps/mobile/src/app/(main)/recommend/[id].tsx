import { Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@apollo/client/react";
import { Text } from "@repo/ui";
import { ActiveTripDocument } from "@repo/types";

import {
  RestaurantDetailView,
  type RestaurantDetailBudgetSummary,
  type RestaurantDetailData,
} from "@/components/RestaurantDetailView";
import { useSession } from "@/hooks/useSession";
import {
  MEAL_TYPE_LABEL,
  findNextUnrecordedMealSlot,
  getRecommendBudgetAmount,
  type MealType,
} from "@/lib/budget";

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
  "1": "6,000원",
  "2": "6,500원",
  "3": "15,000원",
  m1: "6,500원",
  m2: "15,000원",
};

// TODO(F3 데이터 연동): restaurants GraphQL 쿼리(전화/주소/영업시간/메뉴 등)로 교체.
// 지금은 recommend/index.tsx의 MOCK_RESTAURANTS(id: "1"~"3")·MOCK_MAP_MARKERS
// (id: "m1"~"m4") 두 mock 목록에서 넘어오는 id를 모두 커버하는 정적 mock
// (Figma "cuisine-detail (good-price)" node 733:15941, "cuisine-detail
// (common)" node 733:16596 예시 그대로). budgetSummary는 화면에서 mealBudgetAmount로
// 계산해 붙이므로 여기서는 넣지 않는다.
const MOCK_RESTAURANT_DETAILS: Record<string, Omit<RestaurantDetailData, "budgetSummary">> = {
  "1": {
    id: "1",
    source: "good_price",
    name: "범물본가국수 팔달시장점",
    category: "한식",
    distance: "0.4km",
    phone: "051-123-4567",
    address: "대구광역시 북구 팔달로 135 1층",
    menu: [
      { name: "잔치국수", price: "6,000원" },
      { name: "비빔국수", price: "7,000원" },
      { name: "들깨칼국수", price: "8,000원" },
      { name: "만두국", price: "7,500원" },
      { name: "비빔밥", price: "8,500원" },
    ],
  },
  "2": {
    id: "2",
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
  "3": {
    id: "3",
    source: "good_price",
    name: "윤소인남산고단백장어죽집",
    category: "한식",
    distance: "0.7km",
    phone: "053-234-5678",
    address: "대구광역시 중구 동성로 19-11",
    menu: [
      { name: "장어덮밥", price: "15,000원" },
      { name: "장어구이", price: "20,000원" },
    ],
  },
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

  const { session } = useSession();
  const { data } = useQuery(ActiveTripDocument, {
    variables: { userId: session?.user.id ?? "" },
    skip: !session,
    fetchPolicy: "cache-and-network",
  });
  const tripNode = data?.tripsCollection.edges[0]?.node;
  const tripId = tripNode?.id;

  const mealSlots = (tripNode?.meal_slotsCollection?.edges ?? []).map((edge) => ({
    date: edge.node.date,
    mealType: edge.node.meal_type as MealType,
    budgetAmount: edge.node.budget_amount,
    carriedOverAmount: edge.node.carried_over_amount,
    isRecorded: edge.node.is_recorded,
  }));
  // F3-3: 가격보기와 동일하게 가장 이른 미기록 끼니 슬롯을 예산 상한 기준으로 삼는다.
  const nextMealSlot = findNextUnrecordedMealSlot(mealSlots);

  const restaurant: RestaurantDetailData | undefined = mockDetail
    ? {
        ...mockDetail,
        budgetSummary:
          mockPrice && nextMealSlot
            ? toBudgetSummary(mockPrice, nextMealSlot.mealType, getRecommendBudgetAmount(nextMealSlot))
            : undefined,
      }
    : undefined;

  if (!restaurant) {
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
