import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header, Text, colors, spacing } from "@repo/ui";

// PLACEHOLDER: G0~G17 배지 판정 로직·시드 데이터가 아직 없어 자리만 마련해둔다.
// 진입 경로가 둘이라(trip-complete의 CTA, mypage의 "배지함" 메뉴) 뒤로가기 목적지가
// 다르다 — trip-complete는 Figma상 뒤로가기가 없는 종료 화면이라 거기서 들어왔으면
// 홈으로 보내고(그렇지 않으면 완료 화면으로 되돌아가는 막다른 루프가 됨), 그 외
// (mypage 등)에서 들어왔으면 평범하게 router.back()으로 원래 화면으로 돌아간다.
export default function BadgesScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ from?: string }>();

  const handleBackPress = () => {
    if (params.from === "trip-complete") {
      router.replace("/");
      return;
    }
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="배지 · 포인트" onBackPress={handleBackPress} />
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
