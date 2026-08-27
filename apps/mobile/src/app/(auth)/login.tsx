import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Button, Character, ListRow, colors, radius, spacing, stroke, typography } from "@repo/ui";
import type { CharacterVariant } from "@repo/ui";

import { BrandIcon } from "@/components/BrandIcon";
import { signInWithGoogle, signInWithKakao } from "@/lib/auth";
import { hasAgreedToSignUpTerms, isLikelyNewUser } from "@/lib/onboarding";

type ScreenStatus = "idle" | "logging-in" | "error";

const CHARACTER_VARIANTS: CharacterVariant[] = ["apricot", "aqua", "sky", "slate", "coral"];

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<ScreenStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async (provider: "google" | "kakao") => {
    setStatus("logging-in");
    try {
      const user = await (provider === "google" ? signInWithGoogle() : signInWithKakao());
      if (!user) {
        setStatus("idle");
        return;
      }

      if (isLikelyNewUser(user) && !(await hasAgreedToSignUpTerms(user.id))) {
        router.replace("/(main)/sign-up-terms");
        return;
      }
      // 기존 사용자는 (auth) 그룹의 세션 가드가 자동으로 (main)으로 이동시킴
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "소셜 로그인 중 오류가 발생했습니다. 다시 시도해주세요.",
      );
      setStatus("error");
    }
  };

  if (status === "error") {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.centeredContent}>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>죄송합니다</Text>
            <Text style={styles.errorSubtitle}>
              {errorMessage ?? "소셜 로그인 중 오류가 발생했습니다. 다시 시도해주세요."}
            </Text>
          </View>
          <Button label="로그인 화면으로" onPress={() => setStatus("idle")} />
        </View>
      </View>
    );
  }

  if (status === "logging-in") {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.centeredContent}>
          <View style={styles.loggingInText}>
            <Text style={styles.loggingInTitle}>인증 중입니다</Text>
            <Text style={styles.loggingInSubtitle}>잠시만 기다려주세요</Text>
          </View>
          <LoadingDots />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.hero}>
        <Text style={styles.title}>여비냠냠</Text>
        <Text style={styles.subtitle}>
          쓴 만큼 다시 계산해서{"\n"}남은 식비에 맞는 밥집을 찾아드려요
        </Text>
      </View>

      <View style={styles.characters}>
        {CHARACTER_VARIANTS.map((variant) => (
          <Character key={variant} variant={variant} size={50} />
        ))}
      </View>

      <View style={styles.spacer} />

      <View style={styles.buttons}>
        <ListRow
          title="카카오로 시작하기"
          icon={<BrandIcon provider="kakao" />}
          titleAlign="center"
          titleWeight="semibold"
          backgroundColor="white"
          onPress={() => handleSignIn("kakao")}
        />
        <ListRow
          title="구글로 시작하기"
          icon={<BrandIcon provider="google" />}
          titleAlign="center"
          titleWeight="semibold"
          backgroundColor="white"
          onPress={() => handleSignIn("google")}
        />
        <Text style={styles.footnote}>계속하면 이용약관 및 개인정보 처리방침에 동의하게 됩니다</Text>
      </View>
    </View>
  );
}

const LoadingDots = () => {
  const opacities = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const animations = opacities.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 150),
          Animated.timing(value, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(value, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay((2 - index) * 150),
        ]),
      ),
    );
    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [opacities]);

  return (
    <View style={styles.loadingDots}>
      {opacities.map((opacity, index) => (
        <Animated.View key={index} style={[styles.loadingDot, { opacity }]} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
    paddingHorizontal: spacing[900],
  },
  hero: {
    marginTop: spacing[2400],
    alignItems: "center",
    gap: spacing[200],
  },
  title: {
    fontFamily: "WILDgag-Bold",
    fontSize: 48,
    color: colors.content.neutral.default,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    color: colors.content.neutral.default,
    textAlign: "center",
  },
  characters: {
    marginTop: spacing[600],
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing[100],
  },
  spacer: {
    flex: 1,
  },
  buttons: {
    gap: spacing[300],
    paddingBottom: spacing[300],
  },
  footnote: {
    fontFamily: typography.fontFamily,
    fontSize: typography.footnoteRegular.fontSize,
    lineHeight: typography.footnoteRegular.lineHeight,
    letterSpacing: typography.footnoteRegular.letterSpacing,
    color: colors.content.neutral.default,
    textAlign: "center",
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    gap: spacing[600],
  },
  errorCard: {
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.default,
    borderRadius: radius.full,
    padding: spacing[400],
    gap: spacing[100],
  },
  errorTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.title3Emphasized.fontSize,
    lineHeight: typography.title3Emphasized.lineHeight,
    letterSpacing: typography.title3Emphasized.letterSpacing,
    fontWeight: typography.title3Emphasized.fontWeight,
    color: colors.content.neutral.default,
    textAlign: "center",
  },
  errorSubtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    color: colors.content.neutral.subtlest,
    textAlign: "center",
  },
  loggingInText: {
    gap: spacing[100],
  },
  loggingInTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.title3Emphasized.fontSize,
    lineHeight: typography.title3Emphasized.lineHeight,
    letterSpacing: typography.title3Emphasized.letterSpacing,
    fontWeight: typography.title3Emphasized.fontWeight,
    color: colors.content.neutral.default,
    textAlign: "center",
  },
  loggingInSubtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    color: colors.content.neutral.subtlest,
    textAlign: "center",
  },
  loadingDots: {
    marginTop: spacing[600],
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing[200],
  },
  loadingDot: {
    width: spacing[200],
    height: spacing[200],
    borderRadius: radius.full,
    backgroundColor: colors.surface.primary.default,
  },
});
