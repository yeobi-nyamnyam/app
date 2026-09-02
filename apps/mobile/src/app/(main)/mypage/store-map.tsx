import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header, Text, colors, spacing } from "@repo/ui";

// PLACEHOLDER: 방문 매장 지도(M2) 화면 — 희정 담당 영역이라 자리만 마련해둔다
// (docs/team-assignment.md "재배정" 참고).
export default function StoreMapScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="방문 매장 지도" onBackPress={() => router.back()} />
      <View style={styles.content}>
        <Text variant="bodyRegular" color="subtle" align="center">
          방문 매장 지도가 들어갈 자리입니다.
        </Text>
        <Text variant="footnoteRegular" color="subtlest" align="center">
          (M2 — 희정 담당, 아직 미구현)
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
