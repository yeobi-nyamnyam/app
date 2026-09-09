import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon, colors, getFontFamily, radius, spacing, stroke, typography } from "@repo/ui";

/**
 * @param onPress 업로드 버튼을 클릭할 때 발생하는 event 명시 (optional)
 */
export interface ReceiptUploadBoxProps {
  onPress?: () => void;
}

/**
 * 소비 기록 폼(F6) 상단의 영수증 OCR 자동 채우기 안내 박스 (Figma "Receipt Box").
 * onPress는 RecordForm에서 카메라/갤러리 선택 후 record/ocr-review(F6-2/F6-3) 페이지를 연다.
 */
export const ReceiptUploadBox = ({ onPress }: ReceiptUploadBoxProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>영수증으로 자동 채우기</Text>
        <Text style={styles.description}>OCR로 매장명·가격 등을 자동으로 채워드려요 (선택)</Text>
      </View>
      <Pressable style={styles.button} onPress={onPress}>
        <Icon name="camera" size="xsmall" />
        <Text style={styles.buttonLabel}>업로드</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[12],
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    borderRadius: radius[10],
    backgroundColor: colors.surface.neutral.subtle,
  },
  textBlock: {
    flex: 1,
    gap: spacing[2],
  },
  title: {
    fontFamily: getFontFamily(typography.headlineEmphasized.fontWeight),
    fontSize: typography.headlineEmphasized.fontSize,
    lineHeight: typography.headlineEmphasized.lineHeight,
    letterSpacing: typography.headlineEmphasized.letterSpacing,
    fontWeight: typography.headlineEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  description: {
    fontFamily: getFontFamily(typography.subheadlineRegular.fontWeight),
    fontSize: typography.subheadlineRegular.fontSize,
    lineHeight: typography.subheadlineRegular.lineHeight,
    letterSpacing: typography.subheadlineRegular.letterSpacing,
    fontWeight: typography.subheadlineRegular.fontWeight,
    color: colors.content.neutral.default,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    borderRadius: radius.full,
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.default,
    backgroundColor: colors.surface.neutral.default,
  },
  buttonLabel: {
    fontFamily: getFontFamily(typography.calloutRegular.fontWeight),
    fontSize: typography.calloutRegular.fontSize,
    lineHeight: typography.calloutRegular.lineHeight,
    letterSpacing: typography.calloutRegular.letterSpacing,
    fontWeight: typography.calloutRegular.fontWeight,
    color: colors.content.neutral.default,
  },
});
