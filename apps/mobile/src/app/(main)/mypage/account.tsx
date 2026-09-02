import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header, Text, colors, spacing } from "@repo/ui";

// PLACEHOLDER: 계정 관리 설정 화면 (Figma depth1-1, node 410:2346). 로그아웃/회원탈퇴는
// 마이페이지 허브(mypage/index.tsx)에 이미 동작하는 채로 남겨뒀고, 여기는 그 외
// 계정 설정 항목(알림, 프로필 수정 등)이 추가될 자리다.
export default function AccountScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="계정 관리 설정" onBackPress={() => router.back()} />
      <View style={styles.content}>
        <Text variant="bodyRegular" color="subtle" align="center">
          계정 관리 설정이 들어갈 자리입니다.
        </Text>
        <Text variant="footnoteRegular" color="subtlest" align="center">
          (아직 미구현 — 로그아웃/회원탈퇴는 마이페이지에서 바로 가능해요)
        </Text>
      </View>
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
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[4],
    paddingHorizontal: spacing[24],
  },
});
