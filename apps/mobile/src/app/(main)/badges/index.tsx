import { useState } from "react";
import { ScrollView, StyleSheet, Text as RNText, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@apollo/client/react";
import {
  BadgeCard,
  Chip,
  Header,
  NavBar,
  Text,
  badgeNames,
  colors,
  getFontFamily,
  radius,
  spacing,
  stroke,
  typography,
  type BadgeId,
  type NavBarItemKey,
} from "@repo/ui";
import { BadgeCollectionDocument } from "@repo/types";

import { BadgeAnnounceIcon } from "@/components/BadgeAnnounceIcon";
import { useSession } from "@/hooks/useSession";
import { useAlertModal } from "@/hooks/useAlertModal";

// 배지 보관함 (G0, Figma node 407:2177 "User_4 - 배지 / 포인트 현황"). mypage/index.tsx와
// 마찬가지로 이 프레임도 packages/tokens에 없는 별도 팔레트(text/strong, semantic/
// highlight/travel, primitive/slate 등)로 그려져 있어 가장 가까운 기존 토큰으로
// 매핑했다(사용자 확인 완료) — 앱 전체 시각적 일관성 유지가 우선.
//
// badgeNames(BadgeId → 한글명)을 뒤집어 badges.name(한글명)으로 아이콘 에셋을 찾는다
// (trip-complete/index.tsx와 동일한 패턴).
const BADGE_ID_BY_NAME = Object.fromEntries(
  Object.entries(badgeNames).map(([id, name]) => [name, id as BadgeId]),
) as Record<string, BadgeId>;

const CATEGORY_ORDER = [
  "예산 준수형",
  "소비 패턴/캐릭터형",
  "계획 변경 유연성",
  "착한가격/데이터 활용형",
  "지역 탐방/다양성",
  "습관/연속기록형",
  "온보딩/입문형",
];

// G12/G13/G15는 여러 여행에 걸쳐 누적되는 조건이라, 잠긴 상태에서도 실제 진행률을
// 계산해서 보여준다(사용자 확인 완료). 나머지 14개는 여행 하나가 끝날 때 한 번에
// 판정되는 조건이라 진행률 표시가 의미 없어 "조건 미달" 고정 문구로 둔다.
// G12의 분모는 region_cache 시드 전체 지역 수(현재 17개 시/도) — "팔도"는 실제
// 지역 수가 아니라 "전국 팔도"라는 관용구에서 따온 배지명이라는 점 확인 완료.
interface CumulativeBadgeProgress {
  current: number;
  target: number;
  cardLabel: string;
  hint: string;
}

export default function BadgesScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ from?: string }>();
  const { session } = useSession();
  const { showAlert } = useAlertModal();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data, loading } = useQuery(BadgeCollectionDocument, {
    variables: { userId: session?.user.id ?? "" },
    skip: !session,
    fetchPolicy: "cache-and-network",
  });

  const allBadges = data?.badgesCollection.edges.map((edge) => edge.node) ?? [];
  const earnedEdges = data?.user_badgesCollection.edges ?? [];
  const earnedBadgeIds = new Set(earnedEdges.map((edge) => edge.node.badge_id));
  const totalPoints = (data?.exp_ledgerCollection.edges ?? []).reduce(
    (sum, edge) => sum + edge.node.points,
    0,
  );
  const completedTrips = (data?.tripsCollection.edges ?? [])
    .map((edge) => edge.node)
    .filter((trip) => trip.status === "completed");
  const totalRegionCount = data?.region_cacheCollection.edges.length ?? 0;

  const distinctRegionCount = new Set(completedTrips.map((trip) => trip.region_code)).size;
  const regionVisitCounts = completedTrips.reduce<Record<string, number>>((acc, trip) => {
    acc[trip.region_code] = (acc[trip.region_code] ?? 0) + 1;
    return acc;
  }, {});
  const maxSameRegionVisits = Object.values(regionVisitCounts).reduce(
    (max, count) => Math.max(max, count),
    0,
  );
  const completedTripCount = completedTrips.length;

  const cumulativeProgressByCode: Record<string, CumulativeBadgeProgress> = {
    G12: {
      current: distinctRegionCount,
      target: 3,
      cardLabel: `${distinctRegionCount}/${totalRegionCount}개 지역`,
      hint: `팔도 미식가까지 새로운 지역 ${Math.max(3 - distinctRegionCount, 0)}곳이 남았어요. 새로운 지역에서 기록해보세요!`,
    },
    G13: {
      current: maxSameRegionVisits,
      target: 2,
      cardLabel: `${maxSameRegionVisits}/2회 방문`,
      hint: `로컬 크루까지 동일 지역 방문 ${Math.max(2 - maxSameRegionVisits, 0)}회가 남았어요. 단골 매장을 만들어보세요!`,
    },
    G15: {
      current: completedTripCount,
      target: 3,
      cardLabel: `${completedTripCount}/3회 완료`,
      hint: `N회 여행 완주까지 ${Math.max(3 - completedTripCount, 0)}번의 여행이 남았어요. 계속 기록해보세요!`,
    },
  };

  const badgesByTrip = new Map<string, { tripName: string; count: number; latestAwardedAt: string }>();
  for (const { node } of earnedEdges) {
    const existing = badgesByTrip.get(node.trip_id);
    if (existing) {
      existing.count += 1;
      if (node.awarded_at > existing.latestAwardedAt) existing.latestAwardedAt = node.awarded_at;
    } else {
      badgesByTrip.set(node.trip_id, {
        tripName: node.trips?.name ?? "여행",
        count: 1,
        latestAwardedAt: node.awarded_at,
      });
    }
  }
  const newBadgeBanner = [...badgesByTrip.values()].sort((a, b) =>
    a.latestAwardedAt < b.latestAwardedAt ? 1 : -1,
  )[0];

  const lockedCumulativeBadges = allBadges
    .filter((badge) => !earnedBadgeIds.has(badge.id))
    .flatMap((badge) => {
      const progress = cumulativeProgressByCode[badge.code];
      return progress ? [{ code: badge.code, progress }] : [];
    });
  const nextGoalHint =
    lockedCumulativeBadges.length > 0
      ? lockedCumulativeBadges.reduce((best, entry) =>
          entry.progress.current / entry.progress.target > best.progress.current / best.progress.target
            ? entry
            : best,
        ).progress.hint
      : null;

  const filteredBadges = selectedCategory
    ? allBadges.filter((badge) => badge.category === selectedCategory)
    : allBadges;

  const handleBackPress = () => {
    if (params.from === "trip-complete") {
      router.replace("/");
      return;
    }
    router.back();
  };

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
      <Header title="배지 보관함" onBackPress={handleBackPress} />
      <ScrollView contentContainerStyle={styles.content}>
        {loading && !data ? (
          <Text color="subtlest" align="center">
            배지 정보를 불러오는 중...
          </Text>
        ) : (
          <>
            {newBadgeBanner ? (
              <View style={styles.banner}>
                <View style={styles.bannerIconSlot}>
                  <BadgeAnnounceIcon size={28} />
                </View>
                <View style={styles.bannerTextCol}>
                  <RNText style={styles.bannerTitle}>{`새 배지 ${newBadgeBanner.count}개 도착!`}</RNText>
                  <Text variant="footnoteRegular" color="subtle">
                    {`${newBadgeBanner.tripName}에서 받은 배지예요`}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.statsRow}>
              <Stat value={earnedBadgeIds.size} label="획득" />
              <Stat value={allBadges.length - earnedBadgeIds.size} label="미획득" />
              <Stat value={totalPoints} label="포인트" />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              <Chip text="전체" active={selectedCategory === null} onPress={() => setSelectedCategory(null)} />
              {CATEGORY_ORDER.map((category) => (
                <Chip
                  key={category}
                  text={category}
                  active={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                />
              ))}
            </ScrollView>

            <Text variant="footnoteEmphasized">배지 목록</Text>
            <View style={styles.badgeGrid}>
              {filteredBadges.map((badge) => {
                const earned = earnedBadgeIds.has(badge.id);
                const progress = cumulativeProgressByCode[badge.code];
                const subtitle = earned
                  ? `+${badge.bonus_points}pt`
                  : (progress?.cardLabel ?? "조건 미달");
                return (
                  <BadgeCard
                    key={badge.id}
                    title={badge.name}
                    subtitle={subtitle}
                    badgeId={BADGE_ID_BY_NAME[badge.name]}
                    locked={!earned}
                  />
                );
              })}
            </View>

            {nextGoalHint ? (
              <Text variant="footnoteRegular" color="subtle">
                {nextGoalHint}
              </Text>
            ) : null}
          </>
        )}
      </ScrollView>
      <View style={{ paddingBottom: insets.bottom }}>
        <NavBar active="profile" onChange={handleNavChange} />
      </View>
    </View>
  );
}

const Stat = ({ value, label }: { value: number; label: string }) => (
  <View style={styles.stat}>
    <Text variant="title2Bold">{value}</Text>
    <Text variant="footnoteRegular" color="subtle">
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  content: {
    gap: spacing[14],
    padding: spacing[16],
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[12],
    borderRadius: radius[16],
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[14],
    backgroundColor: colors.surface.error.default,
  },
  bannerIconSlot: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.neutral.default,
  },
  bannerTextCol: {
    flex: 1,
    gap: spacing[2],
  },
  bannerTitle: {
    fontFamily: getFontFamily(typography.calloutEmphasized.fontWeight),
    fontSize: typography.calloutEmphasized.fontSize,
    lineHeight: typography.calloutEmphasized.lineHeight,
    letterSpacing: typography.calloutEmphasized.letterSpacing,
    fontWeight: typography.calloutEmphasized.fontWeight,
    color: colors.content.error.default,
  },
  statsRow: {
    flexDirection: "row",
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.subtle,
    borderRadius: radius[16],
    paddingVertical: spacing[14],
  },
  stat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing[6],
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[10],
  },
});
