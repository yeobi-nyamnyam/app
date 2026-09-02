import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@apollo/client/react";
import { Button, FormField, Header, Text, TextField, colors, spacing } from "@repo/ui";
import { UpdateNicknameDocument } from "@repo/types";

import { useSession } from "@/hooks/useSession";

const MAX_NICKNAME_LENGTH = 10;

// 닉네임 변경. 계정 관리 설정(410:2346)에 "닉네임 변경" 항목은 있지만 실제
// 변경 화면은 Figma에 없어서, 기존 컴포넌트(Header/FormField/TextField/Button)로
// 최소한의 폼 화면을 구성한다.
export default function NicknameScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const params = useLocalSearchParams<{ nickname?: string }>();
  const [nickname, setNickname] = useState(params.nickname ?? "");
  const [saveError, setSaveError] = useState<string | undefined>(undefined);
  const [updateNickname, { loading }] = useMutation(UpdateNicknameDocument);

  const trimmed = nickname.trim();
  const isEmpty = trimmed.length === 0;
  const isTooLong = trimmed.length > MAX_NICKNAME_LENGTH;
  const isValid = !isEmpty && !isTooLong;
  const isUnchanged = trimmed === (params.nickname ?? "");
  const canSave = isValid && !isUnchanged && !loading;

  const fieldError = saveError
    ? saveError
    : isTooLong
      ? `${MAX_NICKNAME_LENGTH}자 이내로 입력해주세요.`
      : isEmpty
        ? "닉네임을 입력해주세요."
        : undefined;

  const handleChangeText = (text: string) => {
    setNickname(text);
    setSaveError(undefined);
  };

  const handleSave = async () => {
    if (!session || !canSave) return;
    try {
      await updateNickname({ variables: { id: session.user.id, nickname: trimmed } });
      router.back();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="닉네임 변경" onBackPress={() => router.back()} />
      <View style={styles.content}>
        <FormField label="닉네임">
          <TextField
            value={nickname}
            onChangeText={handleChangeText}
            placeholder="닉네임을 입력하세요"
            error={fieldError}
          />
        </FormField>
        <View style={styles.counterRow}>
          <Text variant="footnoteRegular" color="subtle">
            {`${trimmed.length}/${MAX_NICKNAME_LENGTH}자`}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Button label={loading ? "저장 중..." : "저장하기"} disabled={!canSave} onPress={handleSave} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  content: {
    flex: 1,
    gap: spacing[8],
    padding: spacing[16],
    paddingTop: spacing[14],
  },
  counterRow: {
    alignItems: "flex-end",
  },
  footer: {
    padding: spacing[16],
  },
});
