import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal as RNModal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@apollo/client/react";
import {
  Button,
  Header,
  Modal as DialogModal,
  NavBar,
  Text,
  colors,
  getFontFamily,
  radius,
  spacing,
  stroke,
  typography,
  type NavBarItemKey,
} from "@repo/ui";
import { ActiveTripDocument } from "@repo/types";

import { formatWon, todayDate } from "@/lib/format";
import { useSession } from "@/hooks/useSession";
import {
  getReceiptSignedUrl,
  pickReceiptImage,
  recognizeReceipt,
  uploadReceiptImage,
  type ReceiptOcrResult,
} from "@/lib/receipts";
import { resolveReceiptOcr } from "@/lib/receiptOcrBridge";

/**
 * F6-2 영수증 인식 결과 확인 페이지 (Figma "spent-write-recipt" /
 * "spent-write-recipt (error)"). 소비 기록 작성 폼의 "영수증으로 자동 채우기"
 * 업로드에서 진입한다. 저장을 직접 하지 않고 "확인"을 누르면 receiptOcrBridge로
 * 폼에 값을 돌려준 뒤 뒤로 돌아간다. presetStoreName/presetAmount가 있으면
 * (F6-3 수정 화면에서 수동반영하고 돌아온 경우) 재인식하지 않고 그 값을 그대로
 * 보여준다.
 */
export default function RecordOcrReviewScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    tripId: string;
    localUri: string;
    storagePath?: string;
    presetStoreName?: string;
    presetAmount?: string;
  }>();
  const { session } = useSession();

  const [currentUri, setCurrentUri] = useState(decodeURIComponent(params.localUri));
  const [processing, setProcessing] = useState(!params.presetStoreName);
  const [storagePath, setStoragePath] = useState<string | null>(params.storagePath ?? null);
  const [result, setResult] = useState<ReceiptOcrResult | null>(
    params.presetStoreName
      ? {
          recognized: true,
          storeName: params.presetStoreName,
          storeAddress: null,
          amount: Number(params.presetAmount ?? 0),
          bizNumRecognized: true,
        }
      : null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isManualEntry = Boolean(params.presetStoreName);

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

  useEffect(() => {
    if (params.presetStoreName) return;
    const runOcr = async () => {
      setProcessing(true);
      try {
        const localUri = decodeURIComponent(params.localUri);
        const path = await uploadReceiptImage(params.tripId, localUri);
        setStoragePath(path);
        const signedUrl = await getReceiptSignedUrl(path);
        const ocrResult = await recognizeReceipt(signedUrl);
        setResult(ocrResult);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
        setResult({ recognized: false, storeName: null, storeAddress: null, amount: null, bizNumRecognized: false });
      } finally {
        setProcessing(false);
      }
    };
    runOcr();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRepick = async (source: "camera" | "library") => {
    try {
      const uri = await pickReceiptImage(source);
      if (!uri) return;
      setCurrentUri(uri);
      setProcessing(true);
      const path = await uploadReceiptImage(params.tripId, uri);
      setStoragePath(path);
      const signedUrl = await getReceiptSignedUrl(path);
      const ocrResult = await recognizeReceipt(signedUrl);
      setResult(ocrResult);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = () => {
    router.push({
      pathname: "/record/ocr-edit",
      params: {
        tripId: params.tripId,
        localUri: encodeURIComponent(currentUri),
        storagePath: storagePath ?? "",
        storeName: result?.storeName ?? "",
        amount: result?.amount ? String(result.amount) : "",
      },
    });
  };

  const handleConfirm = () => {
    if (!result?.recognized || result.amount === null || !result.storeName) return;
    resolveReceiptOcr({
      storeName: result.storeName,
      amount: result.amount,
      receiptImageUrl: storagePath,
      ocrRaw: { ...result, manuallyConfirmed: isManualEntry },
    });
    router.dismissTo({ pathname: "/record/new", params: { tripId: params.tripId } });
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
        <Image source={{ uri: currentUri }} style={styles.image} />

        <View style={styles.repickRow}>
          <View style={styles.buttonFlex}>
            <Button label="다시 촬영" variant="outline" onPress={() => handleRepick("camera")} />
          </View>
          <View style={styles.buttonFlex}>
            <Button label="사진 선택" variant="outline" onPress={() => handleRepick("library")} />
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
              <View style={[styles.row, styles.rowBorder]}>
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

            {result?.amount !== null && result?.amount !== undefined ? (
              <View style={styles.budgetPreview}>
                <Text>오늘 남은 식비</Text>
                <RNText style={styles.budgetAmount}>
                  {formatWon(Math.max(remainingNow, 0))} → {formatWon(Math.max(remainingAfter, 0))}
                </RNText>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonFlex}>
          <Button label="수정하기" variant="outline" onPress={handleEdit} />
        </View>
        <View style={styles.buttonFlex}>
          <Button label="확인" disabled={!result?.recognized || processing} onPress={handleConfirm} />
        </View>
      </View>
      <View style={{ paddingBottom: insets.bottom }}>
        <NavBar active="record" onChange={handleNavChange} />
      </View>

      <RNModal
        visible={errorMessage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorMessage(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setErrorMessage(null)} />
        <View style={styles.dialogCenter}>
          <DialogModal
            title="오류"
            content={errorMessage ?? ""}
            confirmLabel="확인"
            onConfirm={() => setErrorMessage(null)}
          />
        </View>
      </RNModal>
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
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surface.neutral.alpha["inverse-alpha-30"],
  },
  dialogCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[24],
  },
});
