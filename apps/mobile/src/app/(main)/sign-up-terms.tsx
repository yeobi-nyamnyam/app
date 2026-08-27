import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { CheckBox, Footer, Header, ListRow, colors, getFontFamily, spacing, typography } from "@repo/ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TermsModal } from "@/components/TermsModal";
import { useSession } from "@/hooks/useSession";
import { markSignUpTermsAgreed } from "@/lib/onboarding";
import { supabase } from "@/lib/supabase";

type TermKey = "service" | "privacy" | "age" | "location" | "marketing";

const TERMS: { key: TermKey; title: string; required: boolean }[] = [
  { key: "service", title: "서비스 이용약관", required: true },
  { key: "privacy", title: "개인정보 처리방침", required: true },
  { key: "age", title: "만 14세 이상 확인", required: true },
  { key: "location", title: "위치정보 이용 동의", required: true },
  { key: "marketing", title: "마케팅 정보 수신 동의", required: false },
];

export default function SignUpTermsScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const [checked, setChecked] = useState<Record<TermKey, boolean>>({
    service: false,
    privacy: false,
    age: false,
    location: false,
    marketing: false,
  });
  const [detailTerm, setDetailTerm] = useState<TermKey | null>(null);

  const toggle = (key: TermKey) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const canConfirm = TERMS.filter((term) => term.required).every((term) => checked[term.key]);

  const handleConfirm = async () => {
    if (!session) {
      return;
    }
    await markSignUpTermsAgreed(session.user.id);
    router.replace("/(main)");
  };

  const detailTitle = TERMS.find((term) => term.key === detailTerm)?.title ?? "";

  return (
    <View style={styles.container}>
      <Header title="약관 동의" onBackPress={() => supabase.auth.signOut()} topInset={insets.top} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View>
          <Text style={styles.introTitle}>약관에 동의해주세요</Text>
          <Text style={styles.introSubtitle}>서비스를 이용하기 위해 약관에 동의해야 합니다</Text>
        </View>
        <View style={styles.list}>
          {TERMS.map((term) => (
            <ListRow
              key={term.key}
              title={term.title}
              tailing="전문 보기"
              backgroundColor="white"
              icon={<CheckBox checked={checked[term.key]} />}
              onPress={() => toggle(term.key)}
              onTailingPress={() => setDetailTerm(term.key)}
            />
          ))}
        </View>
      </ScrollView>
      <Footer disabled={!canConfirm} onPress={handleConfirm} bottomInset={insets.bottom} />
      <TermsModal visible={detailTerm !== null} title={detailTitle} onClose={() => setDetailTerm(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  scrollContent: {
    paddingHorizontal: spacing[16],
    paddingTop: spacing[24],
    gap: spacing[16],
  },
  introTitle: {
    fontFamily: getFontFamily(typography.title3Emphasized.fontWeight),
    fontSize: typography.title3Emphasized.fontSize,
    lineHeight: typography.title3Emphasized.lineHeight,
    letterSpacing: typography.title3Emphasized.letterSpacing,
    fontWeight: typography.title3Emphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  introSubtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.calloutRegular.fontSize,
    lineHeight: typography.calloutRegular.lineHeight,
    letterSpacing: typography.calloutRegular.letterSpacing,
    color: colors.content.neutral.subtlest,
  },
  list: {
    gap: spacing[8],
  },
});
