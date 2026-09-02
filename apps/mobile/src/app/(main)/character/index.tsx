import { Alert, ScrollView, StyleSheet, Text as RNText, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@apollo/client/react";
import {
  CharacterGrowth,
  Header,
  NavBar,
  Text,
  colors,
  getFontFamily,
  radius,
  spacing,
  typography,
  type GrowthStage,
  type NavBarItemKey,
} from "@repo/ui";
import { CharacterGrowthDocument } from "@repo/types";

import { useSession } from "@/hooks/useSession";
import {
  EVOLUTION_STAGES,
  getCharacterLevel,
  getCharacterStage,
  getGrowthStage,
  getPointsForLevel,
} from "@/lib/character";

// 캐릭터 성장 화면 (L2/L3, Figma node 406:2141 "User_2 - 캐릭터 '여비' 성장).
// 단계 이름/구간표는 lib/character.ts에서 이 화면을 만들며 Figma 기준으로 확정했다.
// 이 Figma 프레임도 packages/tokens에 없는 별도 팔레트로 그려져 있어 mypage
// 허브 화면과 동일하게 가장 가까운 기존 토큰으로 근사 매핑했다.
export default function CharacterScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useSession();

  const { data, loading } = useQuery(CharacterGrowthDocument, {
    variables: { userId: session?.user.id ?? "" },
    skip: !session,
    fetchPolicy: "cache-and-network",
  });

  const totalPoints = (data?.exp_ledgerCollection.edges ?? []).reduce(
    (sum, edge) => sum + edge.node.points,
    0,
  );
  const level = getCharacterLevel(totalPoints);
  const stage = getGrowthStage(level);
  const stageLabel = getCharacterStage(level);
  const currentLevelPoints = getPointsForLevel(level);
  const nextLevelPoints = getPointsForLevel(level + 1);
  const pointsToNext = Math.max(nextLevelPoints - totalPoints, 0);
  const progressRatio =
    nextLevelPoints > currentLevelPoints
      ? Math.min(Math.max((totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints), 0), 1)
      : 0;

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
    Alert.alert("준비 중", "아직 구현되지 않은 탭이에요.");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="캐릭터 성장" onBackPress={() => router.back()} />
      {loading && !data ? (
        <View style={styles.loadingContent}>
          <Text color="subtlest">캐릭터 정보를 불러오는 중...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.heroSection}>
            <View style={styles.glowOuter} />
            <View style={styles.glowInner} />
            <CharacterGrowth stage={stage} size={130} />
          </View>

          <View style={styles.card}>
            <RNText style={styles.levelTitle}>{`Lv.${level} ${stageLabel}`}</RNText>
            <Text variant="footnoteRegular" color="subtle">
              {`${pointsToNext}pt 더 쌓으면 Lv.${level + 1}로 성장해요`}
            </Text>

            <View style={styles.progressRow}>
              <RNText style={styles.progressCurrent}>{`${totalPoints}pt`}</RNText>
              <Text variant="footnoteRegular" color="subtle">
                {`Lv.${level + 1} · ${nextLevelPoints}pt`}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
            </View>

            <Text variant="footnoteEmphasized">캐릭터 성장 단계</Text>
            <View style={styles.stageRow}>
              {EVOLUTION_STAGES.map((item) => (
                <StageItem key={item.stage} stage={item.stage} label={item.label} levelRangeLabel={item.levelRangeLabel} active={item.stage === stage} />
              ))}
            </View>

            <View style={styles.criteriaCard}>
              <Text variant="footnoteEmphasized">성장 포인트 적립 기준</Text>
              <Text variant="footnoteRegular" color="subtle">
                · 끼니 기록 시 +10P (일 최대 3회)
              </Text>
              <Text variant="footnoteRegular" color="subtle">
                · 하루 예산 내 마감 시 +20P
              </Text>
              <Text variant="footnoteRegular" color="subtle">
                · 착한가격업소 이용 시 +15P
              </Text>
              <Text variant="footnoteRegular" color="subtle">
                · 여행 완주 시 +100P
              </Text>
              <Text variant="footnoteRegular" color="subtle">
                · 배지 획득 시 +20~100P
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
      <View style={{ paddingBottom: insets.bottom }}>
        <NavBar active="profile" onChange={handleNavChange} />
      </View>
    </View>
  );
}

const StageItem = ({
  stage,
  label,
  levelRangeLabel,
  active,
}: {
  stage: GrowthStage;
  label: string;
  levelRangeLabel: string;
  active: boolean;
}) => (
  <View style={[styles.stageItem, active && styles.stageItemActive]}>
    <View style={[styles.stageIconSlot, active && styles.stageIconSlotActive]}>
      <CharacterGrowth stage={stage} size={28} />
    </View>
    <Text variant="footnoteRegular" color="subtlest">
      {levelRangeLabel}
    </Text>
    <Text
      variant={active ? "footnoteEmphasized" : "footnoteRegular"}
      color={active ? "default" : "subtlest"}
      align="center"
    >
      {label}
    </Text>
  </View>
);

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
    paddingBottom: spacing[20],
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[24],
  },
  glowOuter: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: radius.full,
    backgroundColor: colors.surface.primary.subtlest,
  },
  glowInner: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: radius.full,
    backgroundColor: colors.surface.primary.subtle,
  },
  card: {
    gap: spacing[12],
    marginHorizontal: spacing[16],
    padding: spacing[16],
    borderRadius: radius[20],
    backgroundColor: colors.surface.neutral.subtlest,
  },
  levelTitle: {
    fontFamily: getFontFamily(typography.title2Bold.fontWeight),
    fontSize: typography.title2Bold.fontSize,
    lineHeight: typography.title2Bold.lineHeight,
    letterSpacing: typography.title2Bold.letterSpacing,
    fontWeight: typography.title2Bold.fontWeight,
    color: colors.content.neutral.default,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  progressCurrent: {
    fontFamily: getFontFamily(typography.calloutEmphasized.fontWeight),
    fontSize: typography.calloutEmphasized.fontSize,
    lineHeight: typography.calloutEmphasized.lineHeight,
    letterSpacing: typography.calloutEmphasized.letterSpacing,
    fontWeight: typography.calloutEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border.neutral.subtle,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface.primary.default,
  },
  stageRow: {
    flexDirection: "row",
    gap: spacing[8],
  },
  stageItem: {
    flex: 1,
    alignItems: "center",
    gap: spacing[4],
    paddingVertical: spacing[4],
    borderRadius: radius[7],
    backgroundColor: colors.surface.neutral.default,
  },
  stageItemActive: {
    backgroundColor: colors.surface.primary.subtlest,
  },
  stageIconSlot: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  stageIconSlotActive: {
    borderRadius: radius.full,
    backgroundColor: colors.surface.primary.subtlest,
  },
  criteriaCard: {
    gap: spacing[6],
    padding: spacing[14],
    borderRadius: radius[16],
    backgroundColor: colors.surface.neutral.default,
  },
});
