import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Text } from "@repo/ui";

import {
  RestaurantDetailView,
  type RestaurantDetailBudgetSummary,
  type RestaurantDetailData,
} from "@/components/RestaurantDetailView";

// TODO(F2/F3-3 데이터 연동): 저녁 예산 상한은 예산 산정(F2)/추천 기준 산정(F3-3)
// 결과로 교체. 지금은 recommend/index.tsx의 MEAL_BUDGET_LABEL("18,000원 이하")과
// 동일한 값을 하드코딩.
const MEAL_BUDGET_AMOUNT = 18000;

const parsePrice = (price: string) => Number(price.replace(/[^0-9]/g, ""));

const toBudgetSummary = (price: string): RestaurantDetailBudgetSummary => {
  const priceNumber = parsePrice(price);
  const remaining = MEAL_BUDGET_AMOUNT - priceNumber;
  return {
    price,
    budgetPercent: Math.round((priceNumber / MEAL_BUDGET_AMOUNT) * 100),
    remainingLabel: `${remaining.toLocaleString("ko-KR")}원`,
  };
};

// TODO(F3 데이터 연동): restaurants GraphQL 쿼리(전화/주소/영업시간/메뉴 등)로 교체.
// 지금은 recommend/index.tsx의 MOCK_RESTAURANTS(id: "1"~"3")·MOCK_MAP_MARKERS
// (id: "m1"~"m4") 두 mock 목록에서 넘어오는 id를 모두 커버하는 정적 mock
// (Figma "cuisine-detail (good-price)" node 733:15941, "cuisine-detail
// (common)" node 733:16596 예시 그대로).
const MOCK_RESTAURANT_DETAILS: Record<string, RestaurantDetailData> = {
  "1": {
    id: "1",
    source: "good_price",
    name: "범물본가국수 팔달시장점",
    category: "한식",
    distance: "0.4km",
    phone: "051-123-4567",
    address: "대구광역시 북구 팔달로 135 1층",
    budgetSummary: toBudgetSummary("6,000원"),
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
    budgetSummary: toBudgetSummary("6,500원"),
    menu: [
      { name: "돼지국밥", price: "6,500원" },
      { name: "순대국밥", price: "6,500원" },
      { name: "특국밥", price: "8,000원" },
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
    budgetSummary: toBudgetSummary("15,000원"),
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
    budgetSummary: toBudgetSummary("6,500원"),
    menu: [
      { name: "돼지국밥", price: "6,500원" },
      { name: "순대국밥", price: "6,500원" },
      { name: "특국밥", price: "8,000원" },
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
    budgetSummary: toBudgetSummary("15,000원"),
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
  const restaurant = id ? MOCK_RESTAURANT_DETAILS[id] : undefined;

  if (!restaurant) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text variant="bodyRegular" color="subtle">
          음식점을 찾을 수 없어요
        </Text>
      </View>
    );
  }

  return (
    <RestaurantDetailView
      restaurant={restaurant}
      onBackPress={() => router.back()}
      onPressCTA={() => {
        // TODO(F6 연동): "기록" 플로우로 이동. 이 이슈(F3-2) 범위 밖.
      }}
    />
  );
}
