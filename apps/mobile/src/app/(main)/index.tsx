import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@repo/ui";

import { deleteAccount } from "@/lib/account";
import { supabase } from "@/lib/supabase";

export default function HomeScreen() {
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
    <View style={styles.container}>
      <Text>Home</Text>
      <Pressable style={styles.button} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.buttonText}>로그아웃</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleWithdraw}>
        <Text style={[styles.buttonText, styles.withdrawText]}>탈퇴</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
