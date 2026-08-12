import { Pressable, StyleSheet, Text, View } from "react-native";

import { supabase } from "@/lib/supabase";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Home</Text>
      <Pressable style={styles.button} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.buttonText}>로그아웃</Text>
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
});
