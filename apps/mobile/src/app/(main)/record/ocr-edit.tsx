import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@apollo/client/react";
import { Button, FormField, Header, Icon, Text, TextField, colors, spacing } from "@repo/ui";
import { RecordMealLogDocument, SetMealLogReceiptDocument } from "@repo/types";

import { formatDigitsForDisplay, parseDigits } from "@/lib/format";
import { getReceiptSignedUrl, pickReceiptImage, recognizeReceipt, uploadReceiptImage } from "@/lib/receipts";

/**
 * F6-3 영수증 인식 실패/수정 화면 (Figma "spent-write-recipt-edit"). OCR이 상호명/
 * 결제금액을 못 읽었거나 잘못 읽었을 때 사용자가 직접 입력해서 확정한다.
 * 사업자번호는 meal_logs에 저장하는 컬럼이 아니라 이 화면에서는 다루지 않는다.
 */
export default function RecordOcrEditScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    tripId: string;
    mealSlotId: string;
    storagePath: string;
    storeName?: string;
    storeAddress?: string;
    amount?: string;
    raw: string;
  }>();

  const [storagePath, setStoragePath] = useState(params.storagePath || null);
  const [storeName, setStoreName] = useState(params.storeName ?? "");
  const [amount, setAmount] = useState(params.amount ?? "");
  const [reprocessing, setReprocessing] = useState(false);

  const [recordMealLog, { loading: saving }] = useMutation(RecordMealLogDocument);
  const [setMealLogReceipt] = useMutation(SetMealLogReceiptDocument);

  const amountValue = Number(amount);
  const canSubmit = storeName.trim().length > 0 && amount.length > 0 && amountValue > 0 && !saving;

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
      setStoragePath(path);
      const signedUrl = await getReceiptSignedUrl(path);
      const ocrResult = await recognizeReceipt(signedUrl);
      if (ocrResult.storeName) setStoreName(ocrResult.storeName);
      if (ocrResult.amount) setAmount(String(ocrResult.amount));
    } catch (error) {
      Alert.alert("오류", error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
    } finally {
      setReprocessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      const { data: recordData } = await recordMealLog({
        variables: {
          tripId: params.tripId,
          mealSlotId: params.mealSlotId,
          amount: amountValue,
          storeName,
          storeAddress: params.storeAddress || null,
          memo: null,
          source: "home",
        },
      });
      const mealLogId = recordData?.record_meal_log?.id;
      if (mealLogId) {
        let raw: unknown = {};
        try {
          raw = JSON.parse(params.raw);
        } catch {
          raw = {};
        }
        await setMealLogReceipt({
          variables: { mealLogId, receiptImageUrl: storagePath, ocrRaw: raw },
        });
      }
      router.dismissTo("/record");
    } catch (error) {
      Alert.alert("저장 실패", error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
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
                label={reprocessing ? "인식 중..." : "다시 촬영"}
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
        <Button
          label={saving ? "반영 중..." : "수동반영"}
          disabled={!canSubmit}
          onPress={handleSubmit}
        />
      </View>
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
