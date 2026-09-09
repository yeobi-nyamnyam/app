import { StyleSheet, TextInput, View } from "react-native";
import { Badge, Chip, Text, colors, getFontFamily, radius, spacing, stroke, typography } from "@repo/ui";

export interface DiaryToneAction {
  label: string;
  active?: boolean;
  onPress: () => void;
}

/**
 * @param value 일기 본문 텍스트
 * @param onChangeText 본문이 바뀔 때 발생하는 event 명시
 * @param maxLength 본문 최대 글자 수 (optional, 기본값 300)
 * @param editable 입력 가능 여부: true | false (optional, 기본값 true — AI 초안 생성 중엔 false로 잠금)
 * @param generating AI 초안을 생성하는 중인지: true | false (optional, 기본값 false —
 * 톤/재생성 칩을 비활성화해 재클릭으로 인한 중복 요청을 막는다. 전체 화면 스피너는
 * 화면(diary/write.tsx)에서 LoadingOverlay로 별도 처리)
 * @param badgeLabel 상단에 표시할 안내 배지 텍스트 (optional, AI 초안 모드에서만 사용)
 * @param toneActions 하단에 표시할 톤/재생성 칩 목록 (optional, AI 초안 모드에서만 사용)
 */
export interface DiaryTextAreaProps {
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
  editable?: boolean;
  generating?: boolean;
  badgeLabel?: string;
  toneActions?: DiaryToneAction[];
}

/**
 * 여행 일기 작성 화면(D2, D3)의 본문 입력 영역 (Figma "TextArea"). AI 초안
 * 모드에서는 안내 배지 + 톤/재생성 칩을, 직접 쓰기 모드에서는 입력 필드만 보여준다.
 */
export const DiaryTextArea = ({
  value,
  onChangeText,
  maxLength = 300,
  editable = true,
  generating = false,
  badgeLabel,
  toneActions,
}: DiaryTextAreaProps) => {
  return (
    <View style={styles.container}>
      {badgeLabel ? <Badge label={badgeLabel} variant="sky" /> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        editable={editable}
        multiline
        placeholder="오늘 하루는 어땠나요?"
        placeholderTextColor={colors.content.neutral.subtlest}
        style={styles.input}
      />
      <View style={styles.counterRow}>
        <Text variant="footnoteRegular" color="subtle">
          {`(${value.length}/${maxLength})`}
        </Text>
      </View>
      {toneActions && toneActions.length > 0 ? (
        <View style={styles.toneRow}>
          {toneActions.map((action) => (
            <Chip
              key={action.label}
              text={action.label}
              active={action.active}
              disabled={generating}
              onPress={action.onPress}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: spacing[12],
    padding: spacing[20],
    borderWidth: stroke.default,
    borderColor: colors.border.primary.default,
    borderRadius: radius[30],
    backgroundColor: colors.surface.neutral.default,
  },
  input: {
    width: "100%",
    minHeight: 120,
    textAlignVertical: "top",
    fontFamily: getFontFamily(typography.bodyRegular.fontWeight),
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    color: colors.content.neutral.default,
  },
  counterRow: {
    width: "100%",
    alignItems: "flex-end",
  },
  toneRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing[6],
  },
});
