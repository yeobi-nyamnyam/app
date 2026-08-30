import { useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
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

import { SortSheet, type SortOption } from "@/components/SortSheet";

// TODO(F3 데이터 연동): restaurants + F3-3(예산 기준 실시간 산정) GraphQL 쿼리로 교체.
// 지금은 Figma "recommand-price" 화면(node 721:14702) 예시 그대로의 정적 mock.
const MOCK_RESTAURANTS = [
  {
    id: "1",
    name: "범물본가국수 팔달시장점",
    price: "6,000원",
    address: "대구광역시 북구 팔달로 135 1층",
    category: "한식",
    budgetLabel: "예산 0%",
  },
  {
    id: "2",
    name: "대명돼지국밥",
    price: "6,500원",
    address: "대구광역시 북구 호국로43길 27-12 대명돼지국밥",
    category: "한식",
    budgetLabel: "예산 0%",
  },
  {
    id: "3",
    name: "윤소인남산고단백장어죽집",
    price: "15,000원",
    address: "대구광역시 중구 동성로 19-11",
    category: "한식",
    budgetLabel: "예산 0%",
  },
];

const DEFAULT_SORT_VALUE = "price-asc";
const SORT_OPTIONS: SortOption[] = [
  { value: DEFAULT_SORT_VALUE, label: "가격 낮은 순" },
  { value: "price-desc", label: "가격 높은 순" },
];

const parsePrice = (price: string) => Number(price.replace(/[^0-9]/g, ""));

const sortByValue = (items: typeof MOCK_RESTAURANTS, sortValue: string) =>
  [...items].sort((a, b) =>
    sortValue === "price-desc"
      ? parsePrice(b.price) - parsePrice(a.price)
      : parsePrice(a.price) - parsePrice(b.price),
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
 * 추천 탭 "가격보기" 화면 (Figma "recommand-price", node 721:14702 / 733:15526).
 * 지도보기(F3-1)는 아직 없어 세그먼트 클릭 시 "준비 중" alert만 띄운다.
 */
export default function RecommendScreen() {
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<0 | 1>(0);
  const [sortValue, setSortValue] = useState(DEFAULT_SORT_VALUE);
  const [isSortSheetOpen, setSortSheetOpen] = useState(false);

  const handleViewModeChange = (index: 0 | 1) => {
    if (index === 1) {
      Alert.alert("준비 중", "지도보기는 아직 준비 중이에요.");
      return;
    }
    setViewMode(index);
  };

  const hasResults = MOCK_RESTAURANTS.length > 0;
  const sortedRestaurants = sortByValue(MOCK_RESTAURANTS, sortValue);
  const sortLabel = SORT_OPTIONS.find((option) => option.value === sortValue)?.label ?? "";

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <SectionHeader
        title="저녁 18,000원 이하"
        trailing={
          <View style={styles.segmentedControlSlot}>
            <SegmentedControl
              options={["가격보기", "지도보기"]}
              selectedIndex={viewMode}
              onChange={handleViewModeChange}
            />
          </View>
        }
      />
      <View style={styles.introBlock}>
        <Text variant="footnoteRegular">
          가격으로 볼 후보, 착한 가격 업소만 정보를 제공하고 있어요.
        </Text>
        <View style={styles.sortRow}>
          <Text variant="subheadlineEmphasized">조건에 맞는 곳 {MOCK_RESTAURANTS.length}</Text>
          <Pressable style={styles.sort} onPress={() => setSortSheetOpen(true)}>
            <Text variant="subheadlineEmphasized">{sortLabel}</Text>
            <Icon name="chevron-down" size="medium" />
          </Pressable>
        </View>
      </View>
      {hasResults ? (
        <FlatList
          data={sortedRestaurants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <RestaurantCard
              name={item.name}
              price={item.price}
              address={item.address}
              category={item.category}
              budgetLabel={item.budgetLabel}
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
            <Button label="예산 조정" variant="primary" onPress={() => router.push("/budget-edit")} />
          </View>
        </>
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
  },
  budgetAdjustBlock: {
    width: "100%",
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
  },
});
