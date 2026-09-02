import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header, Text, colors, spacing } from "@repo/ui";

// PLACEHOLDER: 포인트·캐릭터 성장(L2/L3) 화면 (Figma depth1-1, node 406:2141).
// 레벨/진화 단계 계산 로직(lib/character.ts)은 mypage 허브에서 먼저 확정했고,
// 단계별 캐릭터 그래픽(알/새싹/미식가/여행왕/마스터)은 이 화면을 만들 때 준비한다.
export default function CharacterScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="포인트 · 캐릭터 성장" onBackPress={() => router.back()} />
      <View style={styles.content}>
        <Text variant="bodyRegular" color="subtle" align="center">
          캐릭터 성장 화면이 들어갈 자리입니다.
        </Text>
        <Text variant="footnoteRegular" color="subtlest" align="center">
          (L2/L3 캐릭터 진화 단계 그래픽 — 아직 미구현)
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
