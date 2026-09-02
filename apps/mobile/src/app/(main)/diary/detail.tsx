import { useState } from "react";
import { Alert, Modal as RNModal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@apollo/client/react";
import { Button, Header, Modal, NavBar, Text, colors, radius, spacing, stroke, type NavBarItemKey } from "@repo/ui";
import { DeleteDiaryDocument } from "@repo/types";

/**
 * 일기 상세 화면 (D4, Figma "diary-detail"). record/history.tsx의 소비 기록
 * 목록에서 일기 카드를 눌러 진입한다. 본문은 읽기 전용으로 보여주고, 상단 "수정"을
 * 누르면 diary/edit.tsx로 이동한다. Figma 시안에는 삭제 동선이 없어 하단에
 * "일기 삭제" 버튼을 추가했다.
 */
export default function DiaryDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    diaryId: string;
    tripId: string;
    dayLabel: string;
    title: string;
    content: string;
    mode: string;
  }>();

  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [deleteDiary, { loading: deleting }] = useMutation(DeleteDiaryDocument);

  const handleEditPress = () => {
    router.push({
      pathname: "/diary/edit",
      params: {
        diaryId: params.diaryId,
        tripId: params.tripId,
        dayLabel: params.dayLabel,
        title: params.title,
        content: params.content,
        mode: params.mode,
      },
    });
  };

  const handleDeletePress = () => setIsDeleteConfirmVisible(true);

  const handleDelete = async () => {
    setIsDeleteConfirmVisible(false);
    try {
      await deleteDiary({ variables: { diaryId: params.diaryId } });
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
      <Header
        title={params.title || "여행 일기"}
        textAlign="start"
        tailing="text"
        tailingText="수정"
        topInset={insets.top}
        onBackPress={() => router.back()}
        onTailingPress={handleEditPress}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text variant="title3Emphasized">{params.dayLabel}</Text>
        <View style={styles.contentBox}>
          <Text>{params.content}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text variant="footnoteRegular" color="subtle">
          삭제한 일기는 되돌릴 수 없어요.
        </Text>
        <Button label="일기 삭제" variant="outline" onPress={handleDeletePress} />
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
            title="일기를 삭제할까요?"
            content="삭제한 일기는 되돌릴 수 없어요."
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
    gap: spacing[8],
  },
  contentBox: {
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.bold,
    borderRadius: radius[30],
    padding: spacing[20],
    gap: spacing[12],
  },
  footer: {
    paddingHorizontal: spacing[16],
    paddingTop: spacing[12],
    paddingBottom: spacing[12],
    gap: spacing[8],
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
