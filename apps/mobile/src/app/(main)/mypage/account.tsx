import { useState } from "react";
import { Alert, Modal as RNModal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@apollo/client/react";
import { Header, Modal, SettingRow, Text, colors, spacing } from "@repo/ui";
import { ProfileDocument } from "@repo/types";

import { deleteAccount } from "@/lib/account";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/hooks/useSession";

// 계정 관리 설정 (Figma node 410:2346, "User_7 - 계정관리설정").
export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWithdrawConfirmVisible, setIsWithdrawConfirmVisible] = useState(false);

  const { data } = useQuery(ProfileDocument, {
    variables: { id: session?.user.id ?? "" },
    skip: !session,
    fetchPolicy: "cache-and-network",
  });
  const nickname = data?.profilesByPk?.nickname;

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
      <Header title="계정 관리 설정" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.rows}>
          <SettingRow
            title="닉네임 변경"
            subtitle={nickname ? `${nickname} · 변경 가능` : undefined}
            onPress={() => router.push({ pathname: "/mypage/nickname", params: { nickname: nickname ?? "" } })}
          />
          <SettingRow title="로그아웃" onPress={handleLogout} />
          <SettingRow title="회원탈퇴" showChevron={false} variant="danger" onPress={handleWithdrawPress} />
        </View>
        <View style={styles.spacer} />
        <Text variant="footnoteRegular" color="subtle" align="center">
          더 이상 여행 예산을 관리하지 않으시나요? 언제든지 탈퇴할 수 있습니다.
        </Text>
      </ScrollView>
      {isProcessing ? (
        <View style={styles.overlay}>
          <Text color="inverse">처리 중...</Text>
        </View>
      ) : null}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  content: {
    flexGrow: 1,
    padding: spacing[16],
    paddingTop: spacing[14],
  },
  rows: {
    gap: spacing[10],
  },
  spacer: {
    flex: 1,
    minHeight: spacing[24],
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.neutral.alpha["inverse-alpha-30"],
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
