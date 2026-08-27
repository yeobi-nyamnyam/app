import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Button, Character, ListRow, colors, radius, spacing, stroke, typography } from "@repo/ui";
import type { CharacterVariant } from "@repo/ui";

import { BrandIcon } from "@/components/BrandIcon";
import { signInWithGoogle, signInWithKakao } from "@/lib/auth";
import { hasAgreedToSignUpTerms } from "@/lib/onboarding";

type ScreenStatus = "idle" | "logging-in" | "error";

const CHARACTER_VARIANTS: CharacterVariant[] = ["apricot", "aqua", "sky", "slate", "coral"];

// spacing 토큰의 Gap 스케일이 1~36px로 재설계되면서 이 값(구 spacing[2400], 96px)에
// 대응하는 토큰이 없어짐 — 토큰이 커버할 때까지 로컬 상수로 유지.
const HERO_MARGIN_TOP = 96;

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

      // "신규 유저"를 서버 데이터로 판별할 방법이 아직 없어서(약관 동의 이력을
      // 저장할 컬럼이 없음), 대신 "이 기기가 이 계정의 약관 동의를 확인한 적이
      // 있는지"만 본다. 뒤로가기로 약관 화면을 벗어나 동의를 안 마친 사람은
      // 다시 로그인할 때마다 이 화면을 계속 다시 보게 된다 (완료 전까지).
      if (!(await hasAgreedToSignUpTerms(user.id))) {
        router.replace("/(main)/sign-up-terms");
        return;
      }
      // 이미 동의를 마친 사용자는 (auth) 그룹의 세션 가드가 자동으로 (main)으로 이동시킴
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
    paddingHorizontal: spacing[36],
  },
  hero: {
    marginTop: HERO_MARGIN_TOP,
    alignItems: "center",
    gap: spacing[8],
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
    marginTop: spacing[24],
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing[4],
  },
  spacer: {
    flex: 1,
  },
  buttons: {
    gap: spacing[12],
    paddingBottom: spacing[12],
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
    gap: spacing[24],
  },
  errorCard: {
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.default,
    borderRadius: radius.full,
    padding: spacing[16],
    gap: spacing[4],
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
    gap: spacing[4],
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
    marginTop: spacing[24],
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing[8],
  },
  loadingDot: {
    width: spacing[8],
    height: spacing[8],
    borderRadius: radius.full,
    backgroundColor: colors.surface.primary.default,
  },
});
