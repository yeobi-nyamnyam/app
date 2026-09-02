import { useState } from "react";
import {
  Alert,
  Modal as RNModal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
} from "react-native";
import { router } from "expo-router";
import { useQuery } from "@apollo/client/react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CharacterGrowth,
  Icon,
  Modal,
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
import { getCharacterLevel, getCharacterStage, getGrowthStage } from "@/lib/character";

/**
 * 마이페이지 허브 화면 (M0, Figma "User_1 - 마이페이지", node 404:2106).
 *
 * 이 Figma 프레임은 packages/tokens에 없는 별도 팔레트(text/strong #1e2327,
 * primary/default #85d0ff 등)로 그려져 있어서, 기존 디자인 토큰 중 가장 가까운
 * 값으로 매핑해 구현했다(사용자 확인 완료) — 앱 전체 시각적 일관성 유지가 우선.
 * 캐릭터 아바타는 Figma "캐릭터 성장" 화면(node 406:2141)의 단계별 에셋을
 * 그대로 옮긴 @repo/ui CharacterGrowth 컴포넌트를 쓴다 — lib/character.ts의
 * getGrowthStage로 현재 레벨에 맞는 단계(1~5)를 계산해서 넘긴다.
 */
export default function MyPageScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWithdrawConfirmVisible, setIsWithdrawConfirmVisible] = useState(false);

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
  // "방문 매장"은 끼니 소비(식비)만 센다 — 기타소비(교통/숙박/기념품/기타)의
  // "이용 내역"은 자유 텍스트를 같은 store_name 컬럼에 저장할 뿐 실제 매장이
  // 아닐 수 있어서(예: "택시", "고속버스터미널") 방문 매장으로 잘못 집계되면 안 됨.
  const storeNames = new Set(
    trips.flatMap((tripEdge) =>
      (tripEdge.node.meal_logsCollection?.edges ?? [])
        .filter((logEdge) => logEdge.node.category === "식비")
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

  const handleWithdrawPress = () => setIsWithdrawConfirmVisible(true);

  const handleWithdraw = async () => {
    setIsWithdrawConfirmVisible(false);
    setIsProcessing(true);
    try {
      await deleteAccount();
    } catch (error) {
      Alert.alert("탈퇴 실패", error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="title2Bold">마이</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarSlot}>
            <CharacterGrowth stage={getGrowthStage(level)} size={36} />
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
                <RNText style={styles.levelText}>{`Lv.${level} ${getCharacterStage(level)}`}</RNText>
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
          <MenuRow title="완료 여행" onPress={() => router.push("/mypage/completed-trips")} />
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
          <Pressable disabled={isProcessing} onPress={handleWithdrawPress}>
            <Text variant="footnoteEmphasized" color="error">
              회원탈퇴
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      <NavBar active="profile" onChange={handleNavChange} />

      <RNModal
        visible={isWithdrawConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsWithdrawConfirmVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setIsWithdrawConfirmVisible(false)} />
        <View style={styles.modalCenter}>
          <Modal
            title="정말 탈퇴하시겠어요?"
            content="계정과 모든 데이터가 삭제되며 되돌릴 수 없어요."
            confirmLabel="탈퇴"
            onCancel={() => setIsWithdrawConfirmVisible(false)}
            onConfirm={handleWithdraw}
          />
        </View>
      </RNModal>
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

// 스토리북에 chevron-right는 없고 chevron-left만 있어서, 대칭인 쉐브론 모양을
// 180도 회전해 재사용한다(새 에셋 추가하지 않음).
const MenuRow = ({ title, onPress }: { title: string; onPress: () => void }) => (
  <Pressable style={styles.menuRow} onPress={onPress}>
    <Text variant="calloutRegular">{title}</Text>
    <View style={styles.chevronRight}>
      <Icon name="chevron-left" size="small" color={colors.content.neutral.subtle} />
    </View>
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
  chevronRight: {
    transform: [{ rotate: "180deg" }],
  },
  accountLinks: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing[16],
    paddingTop: spacing[4],
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surface.neutral.alpha["inverse-alpha-30"],
  },
  modalCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[24],
  },
});
