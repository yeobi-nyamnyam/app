import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header, Text, colors, spacing } from "@repo/ui";

// PLACEHOLDER: G0~G17 배지 판정 로직·시드 데이터·아이콘이 아직 없어 자리만
// 마련해둔다 (trip-complete의 "배지·포인트 현황 보기" CTA가 여기로 온다).
export default function BadgesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="배지 · 포인트" onBackPress={() => router.back()} />
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
