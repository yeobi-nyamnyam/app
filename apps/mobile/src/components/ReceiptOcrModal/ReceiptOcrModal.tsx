import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal as RNModal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  FormField,
  Header,
  Icon,
  Modal as DialogModal,
  NavBar,
  Text,
  TextField,
  colors,
  radius,
  spacing,
  stroke,
  type NavBarItemKey,
} from "@repo/ui";

import { formatDigitsForDisplay, formatWon, parseDigits } from "@/lib/format";
import {
  getReceiptSignedUrl,
  pickReceiptImage,
  recognizeReceipt,
  uploadReceiptImage,
  type ReceiptOcrResult,
} from "@/lib/receipts";

export interface ReceiptOcrFillResult {
  storeName: string;
  amount: number;
  receiptImageUrl: string | null;
  ocrRaw: unknown;
}

/**
 * @param visible 모달 표시 여부: true | false
 * @param localUri 처음 촬영/선택한 영수증 이미지의 로컬 파일 uri
 * @param tripId Storage 업로드 경로({trip_id}/{uuid}.jpg)에 쓸 여행 id
 * @param onClose 모달을 닫을 때 발생하는 event 명시 (배경/뒤로가기, 결과 반영 후 모두 호출)
 * @param onFilled 인식 결과(확인) 또는 수동 입력(수동반영)을 폼에 반영할 때 발생하는 event 명시
 */
export interface ReceiptOcrModalProps {
  visible: boolean;
  localUri: string;
  tripId: string;
  onClose: () => void;
  onFilled: (result: ReceiptOcrFillResult) => void;
}

type Step = "review" | "edit";

/**
 * F6-2/F6-3 영수증 인식 결과 확인/수정 모달 (Figma "spent-write-recipt" /
 * "spent-write-recipt (error)" / "spent-write-recipt-edit"). 소비 기록 작성 폼의
 * "영수증으로 자동 채우기" 업로드 버튼에서 열리며, 저장을 직접 하지 않고 인식/수정된
 * 매장명·금액을 onFilled로 폼에 돌려준 뒤 닫힌다. 사업자번호는 meal_logs에 저장하는
 * 컬럼이 아니라 화면 표시(인식 여부)로만 쓰고 ocrRaw에만 남긴다.
 */
export const ReceiptOcrModal = ({ visible, localUri, tripId, onClose, onFilled }: ReceiptOcrModalProps) => {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>("review");
  const [currentUri, setCurrentUri] = useState(localUri);
  const [processing, setProcessing] = useState(true);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [result, setResult] = useState<ReceiptOcrResult | null>(null);

  const [editStoreName, setEditStoreName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // 수동반영을 거쳤는지 — 기록에 "사용자 확인으로 반영됨" 표시를 남기기 위해 ocrRaw에 함께 저장한다.
  const [wasManuallyEdited, setWasManuallyEdited] = useState(false);

  const runOcr = async (uri: string) => {
    setProcessing(true);
    setResult(null);
    setWasManuallyEdited(false);
    try {
      const path = await uploadReceiptImage(tripId, uri);
      setStoragePath(path);
      const signedUrl = await getReceiptSignedUrl(path);
      const ocrResult = await recognizeReceipt(signedUrl);
      setResult(ocrResult);
      setEditStoreName(ocrResult.storeName ?? "");
      setEditAmount(ocrResult.amount ? String(ocrResult.amount) : "");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
      setResult({ recognized: false, storeName: null, storeAddress: null, amount: null, bizNumRecognized: false });
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    setStep("review");
    setCurrentUri(localUri);
    runOcr(localUri);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, localUri]);

  const handleRepick = async (source: "camera" | "library") => {
    try {
      const uri = await pickReceiptImage(source);
      if (!uri) return;
      setCurrentUri(uri);
      await runOcr(uri);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
    }
  };

  const handleNavChange = (key: NavBarItemKey) => {
    onClose();
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

  const handleConfirm = () => {
    if (!result?.recognized || result.amount === null || !result.storeName) return;
    onFilled({
      storeName: result.storeName,
      amount: result.amount,
      receiptImageUrl: storagePath,
      ocrRaw: { ...result, manuallyConfirmed: wasManuallyEdited },
    });
  };

  const handleEditAmountChange = (text: string) => {
    const digits = parseDigits(text);
    setEditAmount(digits > 0 ? String(digits) : "");
  };

  const editAmountValue = Number(editAmount);
  const canSubmitEdit = editStoreName.trim().length > 0 && editAmount.length > 0 && editAmountValue > 0;

  // 수동반영은 바로 저장하지 않고 인식 결과 확인 화면(성공 상태, Figma 781:22432)으로
  // 되돌아가 사용자가 입력한 값을 보여준다. 사업자번호는 수동 입력 항목이 아니지만,
  // 사용자가 직접 확인한 값이라는 의미로 확인됨으로 처리한다.
  const handleManualApply = () => {
    if (!canSubmitEdit) return;
    setResult((prev) => ({
      recognized: true,
      storeName: editStoreName,
      storeAddress: prev?.storeAddress ?? null,
      amount: editAmountValue,
      bizNumRecognized: true,
    }));
    setWasManuallyEdited(true);
    setStep("review");
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
    <RNModal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        <Header
          title="영수증 인식"
          topInset={insets.top}
          onBackPress={step === "edit" ? () => setStep("review") : onClose}
        />

        {step === "review" ? (
          <>
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
              )}
            </ScrollView>

            <View style={styles.footer}>
              <View style={styles.buttonFlex}>
                <Button label="수정하기" variant="outline" onPress={() => setStep("edit")} />
              </View>
              <View style={styles.buttonFlex}>
                <Button label="확인" disabled={!result?.recognized || processing} onPress={handleConfirm} />
              </View>
            </View>
            <View style={{ paddingBottom: insets.bottom }}>
              <NavBar active="record" onChange={handleNavChange} />
            </View>
          </>
        ) : (
          <>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.editContent}>
              <FormField label="상호명">
                <TextField value={editStoreName} onChangeText={setEditStoreName} placeholder="예: 북구네 돼지국밥" />
              </FormField>

              <FormField label="결제금액">
                <TextField
                  value={formatDigitsForDisplay(editAmount)}
                  onChangeText={handleEditAmountChange}
                  placeholder="예: 12,000"
                  keyboardType="number-pad"
                  tailingIcon={<Icon name="krw" size="medium" />}
                />
              </FormField>

              <FormField label="흐릿하거나 잘린 경우">
                <View style={styles.editRepickRow}>
                  <View style={styles.buttonFlex}>
                    <Button
                      label={processing ? "인식 중..." : "다시 촬영"}
                      variant="outline"
                      disabled={processing}
                      onPress={() => handleRepick("camera")}
                    />
                  </View>
                  <View style={styles.buttonFlex}>
                    <Button
                      label="재업로드"
                      variant="outline"
                      disabled={processing}
                      onPress={() => handleRepick("library")}
                    />
                  </View>
                </View>
              </FormField>

              <Text variant="footnoteRegular" color="subtle">
                수동 반영하면 기록에 &apos;사용자 확인으로 반영됨&apos; 표시가 남습니다.
              </Text>
            </ScrollView>

            <View style={styles.editFooter}>
              <Button label="수동반영" disabled={!canSubmitEdit} onPress={handleManualApply} />
            </View>
            <View style={{ paddingBottom: insets.bottom }}>
              <NavBar active="record" onChange={handleNavChange} />
            </View>
          </>
        )}
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
    </RNModal>
  );
};

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
  editContent: {
    padding: spacing[16],
    gap: spacing[12],
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
  editRepickRow: {
    flexDirection: "row",
    gap: spacing[8],
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
  footer: {
    flexDirection: "row",
    gap: spacing[8],
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
  },
  editFooter: {
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface.neutral.alpha["inverse-alpha-30"],
  },
  dialogCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[24],
  },
});
