import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text as RNText, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@apollo/client/react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Character,
  Icon,
  NavBar,
  Text,
  colors,
  getFontFamily,
  radius,
  spacing,
  stroke,
  typography,
  type NavBarItemKey,
} from "@repo/ui";
import { MyPageDashboardDocument } from "@repo/types";

import { deleteAccount } from "@/lib/account";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/hooks/useSession";
import { getCharacterLevel } from "@/lib/character";

/**
 * 마이페이지 허브 화면 (M0, Figma "User_1 - 마이페이지", node 404:2106).
 *
 * 이 Figma 프레임은 packages/tokens에 없는 별도 팔레트(text/strong #1e2327,
 * primary/default #85d0ff 등)로 그려져 있어서, 기존 디자인 토큰 중 가장 가까운
 * 값으로 매핑해 구현했다(사용자 확인 완료) — 앱 전체 시각적 일관성 유지가 우선.
 * 캐릭터 아바타는 진화 단계별 그래픽이 아직 없어 기존 Character 컴포넌트로
 * 자리만 채운다(character/index.tsx에서 실제 단계 그래픽 준비 예정).
 */
export default function MyPageScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data, loading } = useQuery(MyPageDashboardDocument, {
    variables: { userId: session?.user.id ?? "" },
    skip: !session,
    fetchPolicy: "cache-and-network",
  });

  const profile = data?.profilesByPk;
  const totalPoints = (data?.exp_ledgerCollection.edges ?? []).reduce((sum, edge) => sum + edge.node.points, 0);
  const level = getCharacterLevel(totalPoints);
  const badgeCount = data?.user_badgesCollection.edges.length ?? 0;
  const trips = data?.tripsCollection.edges ?? [];
  const completedTripCount = trips.filter((edge) => edge.node.status === "completed").length;
  const storeNames = new Set(
    trips.flatMap((tripEdge) =>
      (tripEdge.node.meal_logsCollection?.edges ?? [])
        .map((logEdge) => logEdge.node.store_name)
        .filter((name): name is string => Boolean(name)),
    ),
  );

  const handleNavChange = (key: NavBarItemKey) => {
    if (key === "profile") return;
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

  const handleLogout = async () => {
    setIsProcessing(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = () => {
    Alert.alert("정말 탈퇴하시겠어요?", "계정과 모든 데이터가 삭제되며 되돌릴 수 없어요.", [
      { text: "취소", style: "cancel" },
      {
        text: "탈퇴",
        style: "destructive",
        onPress: async () => {
          setIsProcessing(true);
          try {
            await deleteAccount();
          } catch (error) {
            Alert.alert("탈퇴 실패", error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
          } finally {
            setIsProcessing(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="title2Bold">마이</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarSlot}>
            <Character variant="sky" size={36} />
          </View>
          <View style={styles.profileCol}>
            {loading && !data ? (
              <Text color="subtlest">프로필 불러오는 중...</Text>
            ) : profile ? (
              <>
                <View style={styles.nicknameRow}>
                  <Text variant="bodyEmphasized">{profile.nickname}</Text>
                  <Text variant="footnoteRegular" color="subtle">
                    @{profile.handle}
                  </Text>
                </View>
                <RNText style={styles.levelText}>{`Lv.${level} 여행자`}</RNText>
              </>
            ) : (
              <Text color="subtlest">프로필이 아직 없어요.</Text>
            )}
          </View>
        </View>

        <View style={styles.statsCard}>
          <Stat value={badgeCount} label="획득 배지" />
          <Stat value={completedTripCount} label="완료 여행" />
          <Stat value={storeNames.size} label="방문 매장" />
        </View>

        <SectionLabel label="보상" />
        <View style={styles.menuSection}>
          <MenuRow title="배지함" onPress={() => router.push("/badges")} />
          <MenuRow title="포인트 · 캐릭터 성장" onPress={() => router.push("/character")} />
        </View>

        <SectionLabel label="기록 · 분석" />
        <View style={styles.menuSection}>
          <MenuRow title="소비 습관 대시보드" onPress={() => router.push("/mypage/habits")} />
          <MenuRow title="방문 매장 지도" onPress={() => router.push("/mypage/store-map")} />
        </View>

        <SectionLabel label="계정" />
        <View style={styles.menuSection}>
          <MenuRow title="계정 관리 설정" onPress={() => router.push("/mypage/account")} />
        </View>

        <View style={styles.accountLinks}>
          <Pressable disabled={isProcessing} onPress={handleLogout}>
            <Text variant="footnoteEmphasized" color="subtle">
              로그아웃
            </Text>
          </Pressable>
          <Pressable disabled={isProcessing} onPress={handleWithdraw}>
            <Text variant="footnoteEmphasized" color="error">
              회원탈퇴
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      <NavBar active="profile" onChange={handleNavChange} />
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

const SectionLabel = ({ label }: { label: string }) => (
  <Text variant="footnoteEmphasized" color="subtle">
    {label}
  </Text>
);

const MenuRow = ({ title, onPress }: { title: string; onPress: () => void }) => (
  <Pressable style={styles.menuRow} onPress={onPress}>
    <Text variant="calloutRegular">{title}</Text>
    <Icon name="arrow-right" size="small" color={colors.content.neutral.subtle} />
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  content: {
    padding: spacing[16],
    gap: spacing[16],
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[14],
    padding: spacing[16],
    borderWidth: stroke.hairline,
    borderColor: colors.border.neutral.subtle,
    borderRadius: radius[20],
    backgroundColor: colors.surface.neutral.default,
  },
  avatarSlot: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius[20],
    backgroundColor: colors.surface.primary.subtlest,
  },
  profileCol: {
    flex: 1,
    gap: spacing[2],
  },
  nicknameRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing[2],
  },
  levelText: {
    fontFamily: getFontFamily(typography.subheadlineEmphasized.fontWeight),
    fontSize: typography.subheadlineEmphasized.fontSize,
    lineHeight: typography.subheadlineEmphasized.lineHeight,
    letterSpacing: typography.subheadlineEmphasized.letterSpacing,
    fontWeight: typography.subheadlineEmphasized.fontWeight,
    color: colors.content.primary.bold,
  },
  statsCard: {
    flexDirection: "row",
    paddingVertical: spacing[16],
    borderWidth: stroke.hairline,
    borderColor: colors.border.neutral.subtle,
    borderRadius: radius[20],
    backgroundColor: colors.surface.neutral.default,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
  },
  menuSection: {
    gap: spacing[8],
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[14],
    borderWidth: stroke.hairline,
    borderColor: colors.border.neutral.subtle,
    borderRadius: radius[16],
    backgroundColor: colors.surface.neutral.default,
  },
  accountLinks: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing[16],
    paddingTop: spacing[4],
  },
});
