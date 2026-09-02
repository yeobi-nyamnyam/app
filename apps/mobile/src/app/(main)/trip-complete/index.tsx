import { ScrollView, StyleSheet, Text as RNText, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@apollo/client/react";
import {
  BadgeCard,
  Button,
  Notice,
  Text,
  TripCompleteIllustration,
  badgeNames,
  colors,
  getFontFamily,
  radius,
  spacing,
  stroke,
  typography,
  type BadgeId,
} from "@repo/ui";
import { TripCompleteDocument } from "@repo/types";

import { formatWon } from "@/lib/format";

// 한글 문자만 받침 유무를 판정하고, 그 외(영문/숫자 등)는 "이"를 기본값으로 쓴다.
const hasFinalConsonant = (text: string): boolean => {
  const lastChar = text.trim().charCodeAt(text.trim().length - 1);
  if (lastChar < 0xac00 || lastChar > 0xd7a3) return true;
  return (lastChar - 0xac00) % 28 !== 0;
};

// badgeNames(BadgeId → 한글명, business-logic-notes.md §6과 동일 배지명)을 뒤집어
// user_badges.badges.name(한글명)으로 아이콘 에셋을 찾는다.
const BADGE_ID_BY_NAME = Object.fromEntries(
  Object.entries(badgeNames).map(([id, name]) => [name, id as BadgeId]),
) as Record<string, BadgeId>;

/**
 * 여행 완료 화면 (F7, Figma "end-journey", node 721:14384). index.tsx가 종료일이
 * 지난 여행을 감지해 complete_trip RPC를 호출한 뒤 tripId와 함께 이 화면으로
 * 리다이렉트한다. 종료 화면이라 뒤로 갈 곳이 없어 헤더/NavBar 없이 CTA 하나만 둔다.
 *
 * G0~G17 배지 판정 로직·시드 데이터가 아직 없어(아이콘은 `@repo/ui`의
 * `badgeAssets`로 이미 준비돼 있음) "획득한 배지" 섹션은 실제 user_badges를
 * 그대로 조회하되(판정 로직이 없어 현재는 비어있을 것), 있으면 BadgeCard로
 * 보여주고 없으면 섹션을 숨긴다. CTA는 아직 없는 배지 화면(/badges) 플레이스홀더로
 * 연결한다.
 */
export default function TripCompleteScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tripId: string }>();

  const { data } = useQuery(TripCompleteDocument, {
    variables: { tripId: params.tripId },
  });

  const tripNode = data?.tripsCollection.edges[0]?.node;
  const badgeEdges = data?.user_badgesCollection.edges ?? [];

  if (!tripNode) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContent}>
          <Text color="subtlest">여행 정보 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  const foodBudget = tripNode.total_budget - tripNode.fixed_cost - tripNode.floating_budget;
  const consumed = (tripNode.meal_slotsCollection?.edges ?? []).reduce(
    (sum, edge) => sum + (edge.node.recorded_amount ?? 0),
    0,
  );
  const saved = foodBudget - consumed;
  const adherence =
    foodBudget <= 0
      ? consumed <= 0
        ? 100
        : 0
      : Math.max(0, Math.min(100, Math.round(100 - (Math.abs(foodBudget - consumed) / foodBudget) * 100)));

  const particle = hasFinalConsonant(tripNode.name) ? "이" : "가";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.characterRow}>
          <TripCompleteIllustration size={120} />
        </View>
        <Text variant="title3Emphasized" align="center">
          {`${tripNode.name}${particle} 끝났어요!`}
        </Text>

        <View style={styles.section}>
          <Text variant="headlineEmphasized" align="center">
            {`식비 예산 준수율 ${adherence}%`}
          </Text>
          <View style={styles.statCard}>
            <RNText style={styles.statCardLabel}>총 사용 식비</RNText>
            <Text variant="title1Bold">{formatWon(consumed)}</Text>
            <Text variant="subheadlineRegular">
              {`${formatWon(foodBudget)} 중 ${formatWon(consumed)} 사용 | ${formatWon(Math.max(saved, 0))} 절약`}
            </Text>
          </View>
        </View>

        {badgeEdges.length > 0 ? (
          <View style={styles.section}>
            <Text variant="headlineEmphasized" align="center">
              획득한 배지 · 포인트
            </Text>
            <View style={styles.badgeList}>
              {badgeEdges.map(({ node }) => (
                <BadgeCard
                  key={node.id}
                  title={node.badges?.name ?? "배지"}
                  point={`+${node.badges?.bonus_points ?? 0}pt`}
                  badgeId={node.badges ? BADGE_ID_BY_NAME[node.badges.name] : undefined}
                />
              ))}
            </View>
          </View>
        ) : null}

        <Notice content="이제부터는 일기만 작성할 수 있어요. 소비 기록은 열람만 가능해요." />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: spacing[12] + insets.bottom }]}>
        <Button label="배지 · 포인트 현황 보기" onPress={() => router.push("/badges")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  loadingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: spacing[16],
    paddingTop: spacing[36],
    gap: spacing[24],
  },
  characterRow: {
    alignItems: "center",
  },
  section: {
    gap: spacing[8],
  },
  statCard: {
    backgroundColor: colors.surface.primary.subtlest,
    borderRadius: radius[23],
    paddingHorizontal: spacing[24],
    paddingVertical: spacing[16],
    gap: spacing[6],
    alignItems: "center",
  },
  statCardLabel: {
    fontFamily: getFontFamily(typography.headlineEmphasized.fontWeight),
    fontSize: typography.headlineEmphasized.fontSize,
    lineHeight: typography.headlineEmphasized.lineHeight,
    letterSpacing: typography.headlineEmphasized.letterSpacing,
    fontWeight: typography.headlineEmphasized.fontWeight,
    color: colors.content.primary.bold,
  },
  badgeList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[8],
  },
  footer: {
    borderTopWidth: stroke.default,
    borderTopColor: colors.border.neutral.subtle,
    paddingHorizontal: spacing[16],
    paddingTop: spacing[12],
  },
});
