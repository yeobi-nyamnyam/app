import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, colors, radius, spacing, stroke, typography } from "@repo/ui";

/**
 * @param visible 모달 노출 여부: true | false
 * @param title 약관 제목 (모달 상단과 본문에 표시됨)
 * @param onClose 닫기 버튼을 클릭하거나 배경을 클릭할 때 발생하는 event 명시
 */
export interface TermsModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
}

export const TermsModal = ({ visible, title, onClose }: TermsModalProps) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: spacing[16] + insets.bottom }]}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView style={styles.body}>
            <Text style={styles.bodyText}>{title}입니다.</Text>
          </ScrollView>
          <Button label="확인" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: colors.surface.neutral.default,
    borderTopLeftRadius: radius[16],
    borderTopRightRadius: radius[16],
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.subtle,
    padding: spacing[16],
    gap: spacing[12],
    maxHeight: "70%",
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.title3Emphasized.fontSize,
    lineHeight: typography.title3Emphasized.lineHeight,
    letterSpacing: typography.title3Emphasized.letterSpacing,
    fontWeight: typography.title3Emphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  body: {
    maxHeight: 320,
  },
  bodyText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    color: colors.content.neutral.subtle,
  },
});
