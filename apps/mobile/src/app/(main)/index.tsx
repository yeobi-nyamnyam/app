import { Alert, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { EmptyTripPrompt, NavBar, colors, spacing, type NavBarItemKey } from "@repo/ui";

export default function HomeScreen() {
  const handleNavChange = (key: NavBarItemKey) => {
    if (key === "home") return;
    if (key === "record") {
      router.push("/record");
      return;
    }
    Alert.alert("준비 중", "아직 구현되지 않은 탭이에요.");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <EmptyTripPrompt
          onCreateTrip={() => router.push("/trip-new")}
          onLoadPastTrip={() => Alert.alert("준비 중", "과거 여행 불러오기는 아직 준비 중이에요.")}
        />
      </View>
      <NavBar active="home" onChange={handleNavChange} />
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
    paddingHorizontal: spacing[16],
  },
});
