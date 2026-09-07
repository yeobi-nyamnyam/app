import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, FormField, Header, Icon, NavBar, Text, TextField, colors, spacing, type NavBarItemKey } from "@repo/ui";

import { formatDigitsForDisplay, parseDigits } from "@/lib/format";
import { pickReceiptImage, uploadReceiptImage } from "@/lib/receipts";
import { useAlertModal } from "@/hooks/useAlertModal";

/**
 * F6-3 영수증 인식 실패/수정 페이지 (Figma "spent-write-recipt-edit"). 상호명/
 * 결제금액을 직접 입력해서 "수동반영"을 누르면 인식 결과 확인 화면(성공 상태)으로
 * 되돌아가 사용자가 한 번 더 확인하도록 한다 — 여기서 바로 저장하지 않는다.
 */
export default function RecordOcrEditScreen() {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlertModal();
  const params = useLocalSearchParams<{
    tripId: string;
    localUri: string;
    storagePath?: string;
    storeName?: string;
    amount?: string;
  }>();

  const [storeName, setStoreName] = useState(params.storeName ?? "");
  const [amount, setAmount] = useState(params.amount ?? "");
  const [localUri, setLocalUri] = useState(params.localUri);
  const [storagePath, setStoragePath] = useState(params.storagePath ?? "");
  const [reprocessing, setReprocessing] = useState(false);

  const amountValue = Number(amount);
  const canSubmit = storeName.trim().length > 0 && amount.length > 0 && amountValue > 0;

  const handleAmountChange = (text: string) => {
    const digits = parseDigits(text);
    setAmount(digits > 0 ? String(digits) : "");
  };

  const handleRetake = async (source: "camera" | "library") => {
    try {
      const uri = await pickReceiptImage(source);
      if (!uri) return;
      setReprocessing(true);
      const path = await uploadReceiptImage(params.tripId, uri);
      setLocalUri(encodeURIComponent(uri));
      setStoragePath(path);
    } catch (error) {
      showAlert("오류", error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
    } finally {
      setReprocessing(false);
    }
  };

  const handleManualApply = () => {
    if (!canSubmit) return;
    router.push({
      pathname: "/record/ocr-review",
      params: {
        tripId: params.tripId,
        localUri,
        storagePath,
        presetStoreName: storeName,
        presetAmount: String(amountValue),
      },
    });
  };

  const handleNavChange = (key: NavBarItemKey) => {
    if (key === "home") {
      router.push("/");
      return;
    }
    if (key === "recommend") {
      router.push("/recommend");
      return;
    }
    if (key === "chat") {
      router.push("/chat");
      return;
    }
    if (key === "record") {
      router.push("/record");
      return;
    }
    if (key === "profile") {
      router.push("/mypage");
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="영수증 인식" topInset={insets.top} onBackPress={() => router.back()} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <FormField label="상호명">
          <TextField value={storeName} onChangeText={setStoreName} placeholder="예: 북구네 돼지국밥" />
        </FormField>

        <FormField label="결제금액">
          <TextField
            value={formatDigitsForDisplay(amount)}
            onChangeText={handleAmountChange}
            placeholder="예: 12,000"
            keyboardType="number-pad"
            tailingIcon={<Icon name="krw" size="medium" />}
          />
        </FormField>

        <FormField label="흐릿하거나 잘린 경우">
          <View style={styles.retakeRow}>
            <View style={styles.buttonFlex}>
              <Button
                label={reprocessing ? "처리 중..." : "다시 촬영"}
                variant="outline"
                disabled={reprocessing}
                onPress={() => handleRetake("camera")}
              />
            </View>
            <View style={styles.buttonFlex}>
              <Button
                label="재업로드"
                variant="outline"
                disabled={reprocessing}
                onPress={() => handleRetake("library")}
              />
            </View>
          </View>
        </FormField>

        <Text variant="footnoteRegular" color="subtle">
          수동 반영하면 기록에 &apos;사용자 확인으로 반영됨&apos; 표시가 남습니다.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="수동반영" disabled={!canSubmit} onPress={handleManualApply} />
      </View>
      <NavBar active="record" onChange={handleNavChange} bottomInset={insets.bottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing[16],
    gap: spacing[12],
  },
  retakeRow: {
    flexDirection: "row",
    gap: spacing[8],
  },
  buttonFlex: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
  },
});
