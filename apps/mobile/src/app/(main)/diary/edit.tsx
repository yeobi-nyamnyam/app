import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@apollo/client/react";
import { FormField, Header, NavBar, TextField, colors, spacing, type NavBarItemKey } from "@repo/ui";
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

  const [updateDiary, { loading: saving }] = useMutation(UpdateDiaryDocument);

  const isDirty = title !== (params.title ?? "") || content !== (params.content ?? "");
  const canSave = content.trim().length > 0 && isDirty && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    try {
      await updateDiary({
        variables: { diaryId: params.diaryId, mode: params.mode, title: title || null, content },
      });
      router.back();
    } catch (error) {
      showAlert("수정 실패", error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
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
    showAlert("준비 중", "아직 구현되지 않은 탭이에요.");
  };

  return (
    <View style={styles.screen}>
      <Header
        title="여행 일기 수정"
        textAlign="start"
        tailing="text"
        tailingText={saving ? "저장 중..." : "완료"}
        topInset={insets.top}
        onBackPress={() => router.back()}
        onTailingPress={handleSave}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <FormField label={params.dayLabel}>
          <TextField value={title} onChangeText={setTitle} placeholder="제목" />
        </FormField>

        <DiaryTextArea value={content} onChangeText={setContent} maxLength={MAX_CONTENT_LENGTH} editable={!saving} />
      </ScrollView>

      <View style={{ paddingBottom: insets.bottom }}>
        <NavBar active="record" onChange={handleNavChange} />
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
});
