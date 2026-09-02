import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header, Text, colors, spacing } from "@repo/ui";

// PLACEHOLDER: G0~G17 배지 판정 로직·시드 데이터가 아직 없어 자리만 마련해둔다
// (trip-complete의 "배지·포인트 현황 보기" CTA가 여기로 온다). trip-complete는
// Figma상 뒤로가기가 없는 종료 화면이라, 여기서 뒤로가기를 누르면 router.back()
// 대신 홈으로 보낸다(그렇지 않으면 완료 화면으로 되돌아가는 막다른 루프가 된다).
export default function BadgesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="배지 · 포인트" onBackPress={() => router.replace("/")} />
      <View style={styles.content}>
        <Text variant="bodyRegular" color="subtle" align="center">
          배지 · 포인트 현황 화면이 들어갈 자리입니다.
        </Text>
        <Text variant="footnoteRegular" color="subtlest" align="center">
          (G0~G17 배지 판정 — 아직 미구현)
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
