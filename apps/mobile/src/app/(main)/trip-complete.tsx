import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header, Text, colors, spacing } from "@repo/ui";

// PLACEHOLDER: F7(여행 완료)·G(배지)는 수진/희정 담당 영역이라 이번 세션 범위 밖.
// 다른 화면에서 이 라우트로 넘어오는 지점을 미리 만들어두기 위한 자리표시 화면.
export default function TripCompleteScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Header title="여행 완료" onBackPress={() => router.back()} topInset={insets.top} />
      <View style={styles.content}>
        <Text variant="bodyRegular" color="subtle" align="center">
          여행 완료 화면이 들어갈 자리입니다.
        </Text>
        <Text variant="footnoteRegular" color="subtlest" align="center">
          (F7·G 배지 — 아직 미구현)
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
