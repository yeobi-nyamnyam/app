import { useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Image,
  Share,
  StyleSheet,
  Text as RNText,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Badge,
  Button,
  DataCardRow,
  FloatingButton,
  Icon,
  Text,
  colors,
  getFontFamily,
  radius,
  spacing,
  stroke,
  typography,
} from "@repo/ui";

export type RestaurantDetailSource = "good_price" | "tour_api";

export interface RestaurantDetailMenuItem {
  name: string;
  /** good_price 업소만 값이 있음 (착한가격업소만 가격 정보 보장) */
  price?: string;
}

/**
 * 착한가격업소만 갖는 요약 정보 (대표 메뉴 가격 카드에 표시).
 *
 * @param price 대표 메뉴 가격 (예: "6,000원")
 * @param mealName 기준이 되는 끼니명 (예: "아침", "점심", "저녁")
 * @param budgetPercent mealName 예산 대비 비율 (예: 33)
 * @param remainingLabel 이 메뉴를 먹고 남는 예산 텍스트 (예: "12,000원")
 */
export interface RestaurantDetailBudgetSummary {
  price: string;
  mealName: string;
  budgetPercent: number;
  remainingLabel: string;
}

export interface RestaurantDetailData {
  id: string;
  source: RestaurantDetailSource;
  name: string;
  category: string;
  distance: string;
  phone: string;
  address: string;
  /** tour_api 업소만 값이 있음 — 착한가격업소 API는 사진을 제공하지 않아 항상 없음 */
  imageUrl?: string;
  /** tour_api 업소만 값이 있음 */
  hours?: string;
  /** tour_api 업소만 값이 있음 */
  holiday?: string;
  /** good_price 업소만 값이 있음 */
  budgetSummary?: RestaurantDetailBudgetSummary;
  menu: RestaurantDetailMenuItem[];
}

/**
 * 지도/전화·주소 등 라벨-값 쌍을 감싸는 테두리 카드 (Figma "Field Card").
 *
 * @param radiusValue 모서리 반경 (px)
 * @param children 안에 들어갈 DataCardRow 목록
 */
const FieldCard = ({ radiusValue, children }: { radiusValue: number; children: ReactNode }) => (
  <View style={[styles.fieldCard, { borderRadius: radiusValue }]}>{children}</View>
);

/**
 * 착한가격업소 상세 화면 상단의 "대표 메뉴 가격" 요약 카드.
 */
const BudgetSummaryCard = ({
  price,
  mealName,
  budgetPercent,
  remainingLabel,
}: RestaurantDetailBudgetSummary) => (
  <View style={styles.summaryCard}>
    <RNText style={styles.summaryLabel}>대표 메뉴 가격</RNText>
    <RNText style={styles.summaryPrice}>{price}</RNText>
    <RNText style={styles.summaryDescription}>
      {mealName} 예산의 {budgetPercent}% | 먹고 나면 {remainingLabel} 남아요
    </RNText>
  </View>
);

/**
 * 추천 탭에서 음식점 카드/마커를 눌렀을 때 이동하는 상세 화면 (Figma
 * "cuisine-detail (good-price)" node 733:15941, "cuisine-detail (common)"
 * node 733:16596). `restaurant.source`에 따라 착한가격업소 전용 UI(배지,
 * 대표 메뉴 가격 요약, 메뉴 가격 표시)와 일반 업소 전용 UI(영업시간·휴일,
 * 메뉴는 이름만)를 분기해서 렌더링한다.
 *
 * @param restaurant 표시할 음식점 상세 데이터
 * @param onBackPress 좌측 상단 뒤로가기 버튼을 클릭할 때 발생하는 event 명시
 * @param onPressCTA 하단 "여기로 정하고 기록" 버튼을 클릭할 때 발생하는 event 명시 (optional)
 */
export interface RestaurantDetailViewProps {
  restaurant: RestaurantDetailData;
  onBackPress: () => void;
  onPressCTA?: () => void;
}

export const RestaurantDetailView = ({
  restaurant,
  onBackPress,
  onPressCTA,
}: RestaurantDetailViewProps) => {
  const insets = useSafeAreaInsets();
  const isGoodPrice = restaurant.source === "good_price";
  // 착한가격업소 API는 사진을 제공하지 않아 imageUrl이 항상 비어 있다 — 이 경우
  // 빈 회색 히어로 박스 대신 히어로 영역 자체를 접어서 보여준다.
  const hasHero = !!restaurant.imageUrl;

  const handleShare = () => {
    Share.share({ message: restaurant.name }).catch(() => {});
  };

  // 히어로 사진은 safe area 아래(status bar 영역 제외)부터 시작한다 (Figma
  // node 733:16597 "Hero Photo" — floating 버튼 줄과 같은 top 오프셋). status
  // bar 영역은 항상 흰 배경이라 아이콘은 항상 dark로 고정한다.
  //
  // 스크롤에 따라 상단 플로팅 버튼 줄 뒤 배경을 투명→흰색으로 전환 (Figma
  // "cuisine-detail (good-price) (middle)" node 743:20390). 히어로 사진이
  // 버튼 줄 뒤로 완전히 지나가는 스크롤 거리(HERO_HEIGHT - 버튼 줄 높이)에
  // 맞춰 페이드가 끝나도록 계산. 히어로가 없으면 처음부터 흰 배경 고정이라
  // 페이드/전환이 필요 없다.
  const scrollY = useRef(new Animated.Value(0)).current;
  const [floatingRowHeight, setFloatingRowHeight] = useState(0);

  const headerBackgroundHeight = spacing[16] + floatingRowHeight + spacing[12];
  const headerFadeDistance = Math.max(HERO_HEIGHT - headerBackgroundHeight, 1);

  const headerBackgroundOpacity = hasHero
    ? scrollY.interpolate({
        inputRange: [0, headerFadeDistance],
        outputRange: [0, 1],
        extrapolate: "clamp",
      })
    : 1;

  const handleFloatingRowLayout = (event: LayoutChangeEvent) => {
    setFloatingRowHeight(event.nativeEvent.layout.height);
  };

  const handleScroll = Animated.event<NativeScrollEvent>(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true },
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Animated.ScrollView style={styles.scroll} onScroll={handleScroll} scrollEventThrottle={16}>
        {hasHero ? (
          <View style={[styles.hero, { marginTop: insets.top }]}>
            <Image
              source={{ uri: restaurant.imageUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <View style={styles.heroDim} />
          </View>
        ) : (
          <View style={{ height: insets.top + headerBackgroundHeight }} />
        )}
        <View style={styles.body}>
          <View style={styles.nameRow}>
            <View style={styles.nameTextSlot}>
              <Text variant="title3Emphasized" numberOfLines={1}>
                {restaurant.name}
              </Text>
            </View>
            {isGoodPrice ? <Badge label="착한가격" variant="slate" /> : null}
          </View>
          <Text variant="calloutRegular" color="default">
            {restaurant.category} | {restaurant.distance}
          </Text>

          {restaurant.budgetSummary ? (
            <View style={styles.section}>
              <BudgetSummaryCard {...restaurant.budgetSummary} />
            </View>
          ) : null}

          <View style={styles.section}>
            <FieldCard radiusValue={radius[23]}>
              {restaurant.hours ? <DataCardRow label="영업시간" value={restaurant.hours} /> : null}
              {restaurant.holiday ? <DataCardRow label="휴일" value={restaurant.holiday} /> : null}
              <DataCardRow label="전화" value={restaurant.phone} />
              <DataCardRow label="주소" value={restaurant.address} />
            </FieldCard>
          </View>

          <View style={styles.section}>
            <Text variant="title3Emphasized">메뉴</Text>
            <View style={styles.menuCardSlot}>
              <FieldCard radiusValue={radius[26]}>
                {restaurant.menu.map((item) => (
                  <DataCardRow
                    key={item.name}
                    variant="menu"
                    cuisine={item.name}
                    price={item.price}
                    showPrice={isGoodPrice}
                  />
                ))}
              </FieldCard>
            </View>
          </View>

          <View style={styles.ctaSlot}>
            <Button label="여기로 정하고 기록" variant="primary" onPress={onPressCTA} />
          </View>
        </View>
      </Animated.ScrollView>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.headerBackground,
          { height: insets.top + headerBackgroundHeight, opacity: headerBackgroundOpacity },
        ]}
      />
      <View
        style={[styles.floatingRow, { top: insets.top + spacing[16] }]}
        onLayout={handleFloatingRowLayout}
      >
        <FloatingButton icon={<Icon name="chevron-left-lg" size="medium" />} onPress={onBackPress} />
        <FloatingButton icon={<Icon name="share" size="medium" />} onPress={handleShare} />
      </View>
    </View>
  );
};

const HERO_HEIGHT = 240;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  scroll: {
    flex: 1,
  },
  hero: {
    width: "100%",
    height: HERO_HEIGHT,
    backgroundColor: colors.surface.neutral.subtlest,
  },
  heroDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface.neutral.alpha["inverse-alpha-30"],
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface.neutral.default,
  },
  floatingRow: {
    position: "absolute",
    left: spacing[16],
    right: spacing[16],
    flexDirection: "row",
    justifyContent: "space-between",
  },
  body: {
    paddingHorizontal: spacing[16],
    paddingTop: spacing[16],
    paddingBottom: spacing[16],
    gap: spacing[4],
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
  },
  nameTextSlot: {
    flexShrink: 1,
  },
  section: {
    marginTop: spacing[12],
  },
  menuCardSlot: {
    marginTop: spacing[4],
  },
  ctaSlot: {
    marginTop: spacing[12],
  },
  fieldCard: {
    width: "100%",
    backgroundColor: colors.surface.neutral.default,
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.default,
    paddingHorizontal: spacing[16],
  },
  summaryCard: {
    width: "100%",
    backgroundColor: colors.surface.primary.subtlest,
    borderRadius: radius[23],
    padding: spacing[20],
    gap: spacing[8],
  },
  summaryLabel: {
    fontFamily: getFontFamily(typography.headlineEmphasized.fontWeight),
    fontSize: typography.headlineEmphasized.fontSize,
    lineHeight: typography.headlineEmphasized.lineHeight,
    letterSpacing: typography.headlineEmphasized.letterSpacing,
    fontWeight: typography.headlineEmphasized.fontWeight,
    color: colors.content.primary.bold,
  },
  summaryPrice: {
    fontFamily: getFontFamily(typography.title1Bold.fontWeight),
    fontSize: typography.title1Bold.fontSize,
    lineHeight: typography.title1Bold.lineHeight,
    letterSpacing: typography.title1Bold.letterSpacing,
    fontWeight: typography.title1Bold.fontWeight,
    color: colors.content.neutral.default,
  },
  summaryDescription: {
    fontFamily: getFontFamily(typography.subheadlineRegular.fontWeight),
    fontSize: typography.subheadlineRegular.fontSize,
    lineHeight: typography.subheadlineRegular.lineHeight,
    letterSpacing: typography.subheadlineRegular.letterSpacing,
    fontWeight: typography.subheadlineRegular.fontWeight,
    color: colors.content.neutral.default,
  },
});
