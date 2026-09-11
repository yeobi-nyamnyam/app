import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useMutation } from "@apollo/client/react";
import { Button, FormField, Header, TextField, colors, spacing, stroke } from "@repo/ui";
import { UpdateDiaryDocument } from "@repo/types";

import { DiaryTextArea } from "@/components/DiaryTextArea";
import { useAlertModal } from "@/hooks/useAlertModal";

const MAX_CONTENT_LENGTH = 300;

/**
 * 일기 수정 화면 (D4, Figma "diary-detail-edit"). diary/detail.tsx의 "수정"을
 * 눌러 진입한다. 제목/본문만 고칠 수 있고, AI/직접 작성 모드(mode)는 Figma 시안에
 * 전환 UI가 없어 그대로 유지한다.
 */
export default function DiaryEditScreen() {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlertModal();
  const params = useLocalSearchParams<{
    diaryId: string;
    tripId: string;
    dayLabel: string;
    title: string;
    content: string;
    mode: string;
  }>();

  const [title, setTitle] = useState(params.title ?? "");
  const [content, setContent] = useState(params.content ?? "");
  const [footerHeight, setFooterHeight] = useState(0);

  const [updateDiary, { loading: saving }] = useMutation(UpdateDiaryDocument);

  const isDirty = title !== (params.title ?? "") || content !== (params.content ?? "");
  const canSave = title.trim().length > 0 && content.trim().length > 0 && !saving;

  // 수정한 내용이 없으면 저장 요청 없이 바로 상세 화면으로 돌아간다.
  const handleSave = async () => {
    if (!canSave) return;
    if (!isDirty) {
      router.back();
      return;
    }
    try {
      await updateDiary({
        variables: { diaryId: params.diaryId, mode: params.mode, title: title || null, content },
      });
      router.back();
    } catch (error) {
      showAlert("수정 실패", error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="여행 일기 수정" textAlign="start" topInset={insets.top} onBackPress={() => router.back()} />
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        extraKeyboardSpace={-footerHeight}
      >
        <FormField label={params.dayLabel}>
          <TextField value={title} onChangeText={setTitle} placeholder="제목" />
        </FormField>

        <DiaryTextArea value={content} onChangeText={setContent} maxLength={MAX_CONTENT_LENGTH} editable={!saving} />
      </KeyboardAwareScrollView>

      <View
        style={[styles.footer, { paddingBottom: spacing[12] + insets.bottom }]}
        onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)}
      >
        <Button label={saving ? "저장 중..." : "완료"} disabled={!canSave} onPress={handleSave} />
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
    gap: spacing[8],
  },
  footer: {
    backgroundColor: colors.surface.neutral.default,
    borderTopWidth: stroke.default,
    borderTopColor: colors.border.neutral.subtle,
    paddingHorizontal: spacing[16],
    paddingTop: spacing[12],
  },
});
