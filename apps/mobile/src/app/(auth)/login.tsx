import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { signInWithGoogle, signInWithKakao } from "@/lib/auth";

type LoadingProvider = "google" | "kakao" | null;

export default function LoginScreen() {
  const [loadingProvider, setLoadingProvider] = useState<LoadingProvider>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setLoadingProvider("google");
    try {
      await signInWithGoogle();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "구글 로그인에 실패했습니다.");
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleKakaoLogin = async () => {
    setErrorMessage(null);
    setLoadingProvider("kakao");
    try {
      await signInWithKakao();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "카카오 로그인에 실패했습니다.");
    } finally {
      setLoadingProvider(null);
    }
  };

  const isDisabled = loadingProvider !== null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>여비냠냠</Text>

      <Pressable
        style={[styles.button, styles.googleButton]}
        onPress={handleGoogleLogin}
        disabled={isDisabled}
      >
        {loadingProvider === "google" ? (
          <ActivityIndicator color="#1F1F1F" />
        ) : (
          <Text style={styles.googleButtonText}>Google로 계속하기</Text>
        )}
      </Pressable>

      <Pressable
        style={[styles.button, styles.kakaoButton]}
        onPress={handleKakaoLogin}
        disabled={isDisabled}
      >
        {loadingProvider === "kakao" ? (
          <ActivityIndicator color="#191919" />
        ) : (
          <Text style={styles.kakaoButtonText}>카카오로 계속하기</Text>
        )}
      </Pressable>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 32,
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DADCE0",
  },
  googleButtonText: {
    color: "#1F1F1F",
    fontSize: 16,
    fontWeight: "600",
  },
  kakaoButton: {
    backgroundColor: "#FEE500",
  },
  kakaoButtonText: {
    color: "#191919",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#D93025",
    marginTop: 16,
    textAlign: "center",
  },
});
