import { ScrollView, StyleSheet, Text as RNText, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@apollo/client/react";
import {
  CharacterGrowth,
  CharacterStageCard,
  GROWTH_STAGE_COLORS,
  Header,
  NavBar,
  Text,
  colors,
  getFontFamily,
  radius,
  spacing,
  typography,
  type NavBarItemKey,
} from "@repo/ui";
import { CharacterGrowthDocument } from "@repo/types";

import { useSession } from "@/hooks/useSession";
import { useAlertModal } from "@/hooks/useAlertModal";
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
  const { showAlert } = useAlertModal();

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
  const stageColor = GROWTH_STAGE_COLORS[stage];
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
    showAlert("준비 중", "아직 구현되지 않은 탭이에요.");
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
            <View style={styles.heroStack}>
              <View style={[styles.glowCircle, styles.glow1, { backgroundColor: stageColor }]} />
              <View style={[styles.glowCircle, styles.glow2, { backgroundColor: stageColor }]} />
              <View style={[styles.glowCircle, styles.glow3, { backgroundColor: stageColor }]} />
              <View style={[styles.glowCircle, styles.glow4, { backgroundColor: stageColor }]} />
              <View style={styles.characterSlot}>
                <CharacterGrowth stage={stage} size={130} />
              </View>
            </View>
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
                <CharacterStageCard
                  key={item.stage}
                  stage={item.stage}
                  label={item.label}
                  levelRangeLabel={item.levelRangeLabel}
                  active={item.stage === stage}
                />
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

const HERO_SIZE = 358;
// 카드가 글로우 바닥과 겹치는 만큼(Figma node 428:6172: top 222px, 글로우 358px
// 기준 358-222=136px) 음수 마진으로 끌어올린다.
const CARD_OVERLAP = HERO_SIZE - 222;

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
  // Figma Body 컨테이너(node 406:2158)의 pt-[14px] — 헤더 바로 밑에 가장 큰
  // 글로우(358px)가 곧장 시작한다.
  heroSection: {
    alignItems: "center",
    paddingTop: spacing[14],
  },
  heroStack: {
    width: HERO_SIZE,
    height: HERO_SIZE,
  },
  // 캐릭터 뒤 배경 글로우 — Figma node 428:6162("bg")는 별도 팔레트가 아니라
  // 캐릭터 자체 색(GROWTH_STAGE_COLORS)을 10% 불투명도로 겹친 동심원 4개라,
  // 안쪽으로 갈수록(원끼리 겹치는 만큼) 저절로 진하게 보인다. 각 원은 Figma
  // 실측값(358/277/204.35/137.81px)대로 캐릭터(node 1244:5433, top 79 · left
  // 111)와 같은 중심을 갖도록 절대 위치로 가운데 정렬한다.
  glowCircle: {
    position: "absolute",
    borderRadius: radius.full,
    opacity: 0.1,
  },
  glow1: {
    top: 0,
    left: 0,
    width: 358,
    height: 358,
  },
  glow2: {
    top: (358 - 277) / 2,
    left: (358 - 277) / 2,
    width: 277,
    height: 277,
  },
  glow3: {
    top: (358 - 204.35) / 2,
    left: (358 - 204.35) / 2,
    width: 204.35,
    height: 204.35,
  },
  glow4: {
    top: (358 - 137.81) / 2,
    left: (358 - 137.81) / 2,
    width: 137.81,
    height: 137.81,
  },
  characterSlot: {
    position: "absolute",
    top: 79,
    left: 111,
    width: 130,
    height: 130,
  },
  card: {
    gap: spacing[12],
    marginTop: -CARD_OVERLAP,
    marginHorizontal: spacing[16],
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[16],
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
  criteriaCard: {
    gap: spacing[6],
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[14],
    borderRadius: radius[16],
    backgroundColor: colors.surface.neutral.default,
  },
});
