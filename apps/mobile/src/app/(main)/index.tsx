import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { NavBar, colors, type NavBarItemKey } from "@repo/ui";

import { deleteAccount } from "@/lib/account";
import { supabase } from "@/lib/supabase";

// TODO: F1(여행 생성)이 붙으면 실제 진행 중인 tripId로 교체
const PLACEHOLDER_TRIP_ID = "00000000-0000-0000-0000-000000000000";

export default function HomeScreen() {
  const handleNavChange = (key: NavBarItemKey) => {
    if (key === "home") return;
    if (key === "record") {
      router.push(`/record/new?tripId=${PLACEHOLDER_TRIP_ID}`);
      return;
    }
    Alert.alert("준비 중", "아직 구현되지 않은 탭이에요.");
  };

  const handleWithdraw = () => {
    Alert.alert("탈퇴하시겠어요?", "탈퇴하면 계정과 저장된 모든 데이터가 삭제되며 되돌릴 수 없습니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "탈퇴",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAccount();
          } catch (error) {
            Alert.alert(
              "탈퇴 실패",
              error instanceof Error ? error.message : "탈퇴 처리 중 오류가 발생했습니다.",
            );
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text>Home</Text>
        <Pressable style={styles.button} onPress={() => supabase.auth.signOut()}>
          <Text style={styles.buttonText}>로그아웃</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleWithdraw}>
          <Text style={[styles.buttonText, styles.withdrawText]}>탈퇴</Text>
        </Pressable>
      </View>
      <NavBar active="home" onChange={handleNavChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "space-between",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#EEEEEE",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  withdrawText: {
    color: colors.content.error.default,
  },
});
