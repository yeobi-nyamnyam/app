import { useState } from "react";
import { Alert, Modal as RNModal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@apollo/client/react";
import {
  Button,
  Chip,
  DataCardRow,
  FormField,
  Header,
  Icon,
  Modal,
  NavBar,
  Text,
  TextField,
  colors,
  radius,
  spacing,
  stroke,
  type NavBarItemKey,
} from "@repo/ui";
import { DeleteMealLogDocument, UpdateMealLogDocument } from "@repo/types";

import { formatDateTime, formatDigitsForDisplay, formatWon, parseDigits } from "@/lib/format";
import type { MealLogCategory } from "@/components/RecordForm";

const OTHER_CATEGORY_OPTIONS: MealLogCategory[] = ["교통", "숙박", "기념품", "기타"];

/**
 * 소비 기록 상세/수정/삭제 화면 (F6-5, F6-6, Figma "meal-detail"/"spent-detail-delete").
 * record/index.tsx의 "기록보기" 목록에서 항목을 눌러 진입한다. 방문 날짜/끼니때는
 * 불변이고, 끼니 소비는 매장/금액/메모만, 기타소비는 카테고리까지 수정 가능하다.
 */
export default function RecordEditScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    logId: string;
    title: string;
    category: MealLogCategory;
    mealTypeLabel?: string;
    createdAt: string;
    visitDate: string;
    amount: string;
    storeName?: string;
    storeAddress?: string;
    memo?: string;
    canDelete: string;
  }>();

  const isMeal = params.category === "식비";
  const canDelete = params.canDelete === "true";

  const [category, setCategory] = useState<MealLogCategory>(params.category);
  const [amount, setAmount] = useState(params.amount);
  const [storeName, setStoreName] = useState(params.storeName ?? "");
  const [memo, setMemo] = useState(params.memo ?? "");
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);

  const [updateMealLog, { loading: updating }] = useMutation(UpdateMealLogDocument);
  const [deleteMealLog, { loading: deleting }] = useMutation(DeleteMealLogDocument);

  const amountValue = Number(amount);
  const isAmountValid = amount.length > 0 && Number.isFinite(amountValue) && amountValue > 0;
  const isDirty =
    category !== params.category || amount !== params.amount || storeName !== (params.storeName ?? "") || memo !== (params.memo ?? "");
  const canSave = isAmountValid && isDirty && !updating;

  const deleteWarning = isMeal
    ? "삭제 시 이 기록의 금액 만큼 예산이 재계산되고, 이후 날짜의 여유 식비도 함께 갱신돼요."
    : "삭제 시 남은 기록을 기준으로 유동비용 및 식비 사용량이 전체 재계산돼요.";

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
          storeName: storeName || null,
          storeAddress: params.storeAddress || null,
          memo: memo || null,
          category: isMeal ? null : category,
        },
      });
      router.back();
    } catch (error) {
      Alert.alert("수정 실패", error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
    }
  };

  const handleDeletePress = () => setIsDeleteConfirmVisible(true);

  const handleDelete = async () => {
    setIsDeleteConfirmVisible(false);
    try {
      await deleteMealLog({ variables: { mealLogId: params.logId } });
      router.back();
    } catch (error) {
      Alert.alert("삭제 실패", error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
    }
  };

  const handleNavChange = (key: NavBarItemKey) => {
    if (key === "record") {
      router.push("/record");
      return;
    }
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
    if (key === "profile") {
      router.push("/mypage");
      return;
    }
    Alert.alert("준비 중", "아직 구현되지 않은 탭이에요.");
  };

  return (
    <View style={styles.screen}>
      <Header title={params.title} onBackPress={() => router.back()} topInset={insets.top} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text variant="title3Emphasized">기록 상세</Text>
          <View style={styles.card}>
            <DataCardRow label={isMeal ? "끼니 유형" : "카테고리"} value={isMeal ? params.mealTypeLabel : params.category} />
            <DataCardRow label="소비일자" value={params.visitDate.replace(/-/g, ".")} />
            <DataCardRow label="작성일자" value={formatDateTime(params.createdAt)} />
            <DataCardRow label={isMeal ? "방문 매장" : "이용 내역"} value={params.storeName || "-"} />
            {isMeal && params.storeAddress ? <DataCardRow label="주소" value={params.storeAddress} /> : null}
            <DataCardRow label="금액" value={formatWon(Number(params.amount))} />
            <DataCardRow label="메모" value={params.memo || "-"} />
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="title3Emphasized">수정 가능한 항목</Text>

          {!isMeal ? (
            <FormField label="카테고리">
              <View style={styles.categoryRow}>
                {OTHER_CATEGORY_OPTIONS.map((option) => (
                  <Chip
                    key={option}
                    text={option}
                    active={category === option}
                    onPress={() => setCategory(option)}
                  />
                ))}
              </View>
            </FormField>
          ) : null}

          <FormField label={isMeal ? "매장 이름" : "이용 내역"}>
            <TextField value={storeName} onChangeText={setStoreName} placeholder="예: 북구네 돼지국밥" />
          </FormField>

          {isMeal && params.storeAddress ? (
            <FormField label="주소">
              <TextField value={params.storeAddress} onChangeText={() => {}} disabled />
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
      </ScrollView>

      <View style={styles.footer}>
        <Text variant="footnoteRegular" color="subtle">
          {deleteWarning}
        </Text>
        <View style={styles.buttonRow}>
          <View style={styles.buttonFlex}>
            <Button label={updating ? "저장 중..." : "수정 저장"} disabled={!canSave} onPress={handleSave} />
          </View>
          <View style={styles.buttonFlex}>
            <Button label="기록 삭제" variant="outline" disabled={!canDelete} onPress={handleDeletePress} />
          </View>
        </View>
      </View>

      <View style={{ paddingBottom: insets.bottom }}>
        <NavBar active="record" onChange={handleNavChange} />
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
            content={deleteWarning}
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing[16],
    gap: spacing[20],
  },
  footer: {
    paddingHorizontal: spacing[16],
    paddingTop: spacing[12],
    paddingBottom: spacing[12],
    gap: spacing[8],
  },
  section: {
    gap: spacing[4],
  },
  card: {
    marginTop: spacing[4],
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.default,
    borderRadius: radius[23],
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[4],
  },
  categoryRow: {
    flexDirection: "row",
    gap: spacing[10],
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing[8],
  },
  buttonFlex: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surface.neutral.alpha["inverse-alpha-30"],
  },
  modalCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[24],
  },
});
