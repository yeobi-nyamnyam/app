import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@apollo/client/react";
import { Button, Header, Text, colors, getFontFamily, radius, spacing, stroke, typography } from "@repo/ui";
import { ActiveTripDocument, RecordMealLogDocument, SetMealLogReceiptDocument } from "@repo/types";

import { formatWon, todayDate } from "@/lib/format";
import {
  getReceiptSignedUrl,
  pickReceiptImage,
  recognizeReceipt,
  uploadReceiptImage,
  type ReceiptOcrResult,
} from "@/lib/receipts";
import { useSession } from "@/hooks/useSession";

/**
 * F6-2 영수증 인식 결과 확인 화면 (Figma "spent-write-recipt"/"spent-write-recipt (error)").
 * 홈 화면 끼니 카드에서 촬영/선택한 이미지를 업로드하고 서버 OCR을 호출한 뒤,
 * 인식된 필드를 보여준다. 상호명/사업자번호/결제금액 중 하나라도 인식이 안 되면
 * "인식안됨"으로 표시하고 확인 버튼을 막아 F6-3 수정 화면으로 유도한다.
 */
export default function RecordOcrReviewScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    tripId: string;
    mealSlotId: string;
    localUri: string;
  }>();
  const { session } = useSession();

  const [localUri, setLocalUri] = useState(decodeURIComponent(params.localUri));
  const [processing, setProcessing] = useState(true);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [result, setResult] = useState<ReceiptOcrResult | null>(null);

  const { data: tripData } = useQuery(ActiveTripDocument, {
    variables: { userId: session?.user.id ?? "" },
    skip: !session,
    fetchPolicy: "cache-and-network",
  });
  const todaySlots = (tripData?.tripsCollection.edges[0]?.node.meal_slotsCollection?.edges ?? [])
    .map((edge) => edge.node)
    .filter((slot) => slot.date === todayDate());
  const dayBudget = todaySlots.reduce((sum, slot) => sum + slot.budget_amount, 0);
  const consumed = todaySlots.reduce((sum, slot) => sum + (slot.recorded_amount ?? 0), 0);
  const remainingNow = dayBudget - consumed;
  const remainingAfter = remainingNow - (result?.amount ?? 0);

  const [recordMealLog, { loading: saving }] = useMutation(RecordMealLogDocument);
  const [setMealLogReceipt] = useMutation(SetMealLogReceiptDocument);

  const runOcr = async (uri: string) => {
    setProcessing(true);
    setResult(null);
    try {
      const path = await uploadReceiptImage(params.tripId, uri);
      setStoragePath(path);
      const signedUrl = await getReceiptSignedUrl(path);
      const ocrResult = await recognizeReceipt(signedUrl);
      setResult(ocrResult);
    } catch (error) {
      Alert.alert("인식 실패", error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
      setResult({ recognized: false, storeName: null, storeAddress: null, amount: null, bizNumRecognized: false });
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    runOcr(localUri);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRepick = async (source: "camera" | "library") => {
    try {
      const uri = await pickReceiptImage(source);
      if (!uri) return;
      setLocalUri(uri);
      await runOcr(uri);
    } catch (error) {
      Alert.alert("오류", error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
    }
  };

  const handleEdit = () => {
    router.push({
      pathname: "/record/ocr-edit",
      params: {
        tripId: params.tripId,
        mealSlotId: params.mealSlotId,
        storagePath: storagePath ?? "",
        storeName: result?.storeName ?? "",
        storeAddress: result?.storeAddress ?? "",
        amount: result?.amount ? String(result.amount) : "",
        raw: JSON.stringify(result ?? {}),
      },
    });
  };

  const handleConfirm = async () => {
    if (!result?.recognized || result.amount === null) return;
    try {
      const { data: recordData } = await recordMealLog({
        variables: {
          tripId: params.tripId,
          mealSlotId: params.mealSlotId,
          amount: result.amount,
          storeName: result.storeName,
          storeAddress: result.storeAddress,
          memo: null,
          source: "home",
        },
      });
      const mealLogId = recordData?.record_meal_log?.id;
      if (mealLogId) {
        await setMealLogReceipt({
          variables: { mealLogId, receiptImageUrl: storagePath, ocrRaw: result },
        });
      }
      router.back();
    } catch (error) {
      Alert.alert("저장 실패", error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
    }
  };

  const renderFieldValue = (value: string | null) =>
    value ? (
      <Text variant="bodyEmphasized">{value}</Text>
    ) : (
      <Text variant="bodyEmphasized" color="error">
        인식안됨
      </Text>
    );

  return (
    <View style={styles.screen}>
      <Header title="영수증 인식" topInset={insets.top} onBackPress={() => router.back()} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Image source={{ uri: localUri }} style={styles.image} />

        <View style={styles.repickRow}>
          <View style={styles.buttonFlex}>
            <Button label="다시 촬영" variant="outline" onPress={() => handleRepick("camera")} />
          </View>
          <View style={styles.buttonFlex}>
            <Button label="갤러리에서 선택" variant="outline" onPress={() => handleRepick("library")} />
          </View>
        </View>

        {processing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.content.primary.bold} />
            <Text color="subtlest">영수증을 인식하고 있어요...</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text variant="bodyRegular">상호명</Text>
                {renderFieldValue(result?.storeName ?? null)}
              </View>
              <View style={[styles.row, styles.rowBorder]}>
                <Text variant="bodyRegular">사업자번호</Text>
                {renderFieldValue(result?.bizNumRecognized ? "확인됨" : null)}
              </View>
              <View style={styles.row}>
                <Text variant="bodyRegular">결제금액</Text>
                {result?.amount !== null && result?.amount !== undefined ? (
                  <Text variant="bodyEmphasized">{formatWon(result.amount)}</Text>
                ) : (
                  <Text variant="bodyEmphasized" color="error">
                    인식안됨
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.budgetPreview}>
              <Text>오늘 남은 식비</Text>
              <RNText style={styles.budgetAmount}>
                {formatWon(Math.max(remainingNow, 0))} → {formatWon(Math.max(remainingAfter, 0))}
              </RNText>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonFlex}>
          <Button label="수정하기" variant="outline" onPress={handleEdit} />
        </View>
        <View style={styles.buttonFlex}>
          <Button
            label={saving ? "저장 중..." : "확인"}
            disabled={!result?.recognized || saving || processing}
            onPress={handleConfirm}
          />
        </View>
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
    paddingBottom: spacing[24],
  },
  image: {
    width: "100%",
    height: 196,
    backgroundColor: colors.border.neutral.default,
  },
  repickRow: {
    flexDirection: "row",
    gap: spacing[8],
    paddingHorizontal: spacing[16],
    paddingTop: spacing[12],
  },
  buttonFlex: {
    flex: 1,
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[8],
    paddingVertical: spacing[36],
  },
  card: {
    marginTop: spacing[12],
    marginHorizontal: spacing[16],
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.default,
    borderRadius: radius[16],
    paddingHorizontal: spacing[16],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing[8],
  },
  rowBorder: {
    borderBottomWidth: stroke.default,
    borderBottomColor: colors.border.neutral.default,
  },
  budgetPreview: {
    marginTop: spacing[12],
    marginHorizontal: spacing[16],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface.primary.subtlest,
    borderRadius: radius[10],
    padding: spacing[12],
  },
  budgetAmount: {
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: typography.bodyEmphasized.fontWeight,
    color: colors.content.primary.bold,
  },
  footer: {
    flexDirection: "row",
    gap: spacing[8],
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
  },
});
