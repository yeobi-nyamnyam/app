import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@apollo/client/react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, NavBar, Text, colors, spacing, type NavBarItemKey } from "@repo/ui";
import { ProfileDocument } from "@repo/types";

import { deleteAccount } from "@/lib/account";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/hooks/useSession";

// 마이페이지 UI는 아직 디자인이 확정되지 않아, 로그아웃/탈퇴 동작만 우선 연결한
// 임시 화면. Figma 반영되면 레이아웃을 다시 작성할 것.
// nickname/handle 표시는 F0-4(profiles row 자동 생성 트리거)가 실제로 동작하는지
// 확인하기 위한 목적도 겸함 — 정식 프로필 UI는 아님.
export default function MyPageScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data, loading: profileLoading } = useQuery(ProfileDocument, {
    variables: { id: session?.user.id ?? "" },
    skip: !session,
  });
  const profile = data?.profilesByPk;

  const handleNavChange = (key: NavBarItemKey) => {
    if (key === "profile") return;
    if (key === "home") {
      router.push("/");
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
            Alert.alert(
              "탈퇴 실패",
              error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
            );
          } finally {
            setIsProcessing(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text variant="title3Emphasized">마이페이지</Text>
        {profileLoading ? (
          <Text color="subtlest">프로필 불러오는 중...</Text>
        ) : profile ? (
          <Text>
            {profile.nickname} ({profile.handle})
          </Text>
        ) : (
          <Text color="subtlest">프로필이 아직 없어요 (F0-4 트리거 미적용?)</Text>
        )}
        <Button label="로그아웃" variant="outline" disabled={isProcessing} onPress={handleLogout} />
        <Button label="탈퇴하기" variant="outline" disabled={isProcessing} onPress={handleWithdraw} />
      </View>
      <NavBar active="profile" onChange={handleNavChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  content: {
    flex: 1,
    padding: spacing[16],
    gap: spacing[12],
  },
});
