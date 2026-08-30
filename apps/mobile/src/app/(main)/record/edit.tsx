import { useState } from "react";
import { Alert, Modal as RNModal, Pressable, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@apollo/client/react";
import {
  Button,
  FormField,
  Header,
  Icon,
  Modal,
  TextField,
  colors,
  spacing,
} from "@repo/ui";
import { DeleteMealLogDocument, UpdateMealLogDocument } from "@repo/types";

import { formatDigitsForDisplay, parseDigits } from "@/lib/format";

/**
 * 소비 기록 수정/삭제 화면 (F6-5, F6-6). record/index.tsx의 "기록보기" 목록에서
 * 항목을 눌러 진입한다. 방문 날짜/끼니 때/카테고리는 불변이라 금액·메모만 수정
 * 가능하고, 매장 이름은 조회용으로만 보여준다.
 */
export default function RecordEditScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    logId: string;
    title: string;
    amount: string;
    storeName?: string;
    storeAddress?: string;
    memo?: string;
  }>();

  const [amount, setAmount] = useState(params.amount);
  const [memo, setMemo] = useState(params.memo ?? "");
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);

  const [updateMealLog, { loading: updating }] = useMutation(UpdateMealLogDocument);
  const [deleteMealLog, { loading: deleting }] = useMutation(DeleteMealLogDocument);

  const amountValue = Number(amount);
  const isAmountValid = amount.length > 0 && Number.isFinite(amountValue) && amountValue > 0;
  const canSave = isAmountValid && !updating;

  const handleAmountChange = (text: string) => {
    const digits = parseDigits(text);
    setAmount(digits > 0 ? String(digits) : "");
  };

  const handleSave = async () => {
    try {
      await updateMealLog({
        variables: {
          mealLogId: params.logId,
          amount: amountValue,
          storeName: params.storeName || null,
          storeAddress: params.storeAddress || null,
          memo: memo || null,
        },
      });
      router.back();
    } catch (error) {
      Alert.alert("수정 실패", error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
    }
  };

  const handleDelete = async () => {
    setIsDeleteConfirmVisible(false);
    try {
      await deleteMealLog({ variables: { mealLogId: params.logId } });
      router.back();
    } catch (error) {
      Alert.alert("삭제 실패", error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title={params.title}
        tailing="text"
        tailingText="삭제"
        onBackPress={() => router.back()}
        onTailingPress={() => setIsDeleteConfirmVisible(true)}
        topInset={insets.top}
      />
      <View style={styles.content}>
        {params.storeName ? (
          <FormField label="매장 이름">
            <TextField value={params.storeName} onChangeText={() => {}} disabled />
          </FormField>
        ) : null}
        <FormField label="금액">
          <TextField
            value={formatDigitsForDisplay(amount)}
            onChangeText={handleAmountChange}
            placeholder="예: 12,000"
            keyboardType="number-pad"
            tailingIcon={<Icon name="krw" size="medium" />}
          />
        </FormField>
        <FormField label="메모">
          <TextField value={memo} onChangeText={setMemo} placeholder="예: 어묵꼬치, 생필품" />
        </FormField>
      </View>
      <View style={[styles.footer, { paddingBottom: spacing[12] + insets.bottom }]}>
        <Button label={updating ? "저장 중..." : "저장하기"} disabled={!canSave} onPress={handleSave} />
      </View>

      <RNModal
        visible={isDeleteConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteConfirmVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setIsDeleteConfirmVisible(false)} />
        <View style={styles.modalCenter}>
          <Modal
            title="기록을 삭제할까요?"
            content="삭제하면 되돌릴 수 없어요. 삭제 조건(다음 끼니 미기록)을 만족하지 않으면 실패할 수 있어요."
            confirmLabel={deleting ? "삭제 중..." : "삭제"}
            onCancel={() => setIsDeleteConfirmVisible(false)}
            onConfirm={handleDelete}
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
  content: {
    flex: 1,
    padding: spacing[16],
    gap: spacing[12],
  },
  footer: {
    width: "100%",
    paddingHorizontal: spacing[16],
    paddingTop: spacing[12],
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface.neutral.alpha["inverse-alpha-30"],
  },
  modalCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[24],
  },
});
