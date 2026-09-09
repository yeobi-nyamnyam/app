import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Text, colors, radius, spacing } from "@repo/ui";

export interface SortOption {
  value: string;
  label: string;
}

/**
 * 정렬 기준을 고르는 바텀시트. Figma 디자인이 따로 없어 `ChatRecordSheet`(바텀시트)와
 * 같은 grabber/radius/backdrop 패턴을 그대로 따른다.
 *
 * @param visible 시트가 열려있는지
 * @param options 정렬 선택지 목록, 각 항목은 { value, label }
 * @param selectedValue 현재 선택된 옵션의 value
 * @param onSelect 옵션을 선택할 때 발생하는 event 명시, 선택한 value를 전달
 * @param onClose 시트를 닫을 때(배경 클릭, 뒤로가기, 옵션 선택 후) 발생하는 event 명시
 */
export interface SortSheetProps {
  visible: boolean;
  options: SortOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export const SortSheet = ({
  visible,
  options,
  selectedValue,
  onSelect,
  onClose,
}: SortSheetProps) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grabberRow}>
            <View style={styles.grabber} />
          </View>
          <View style={styles.optionList}>
            {options.map((option) => {
              const selected = option.value === selectedValue;
              return (
                <Pressable
                  key={option.value}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                >
                  <Text variant={selected ? "bodyEmphasized" : "bodyRegular"}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
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
    width: "100%",
    alignItems: "center",
    overflow: "hidden",
    paddingBottom: spacing[24],
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    backgroundColor: colors.surface.neutral.default,
  },
  grabberRow: {
    width: "100%",
    height: 16,
    alignItems: "center",
    paddingTop: spacing[5],
  },
  grabber: {
    width: 58,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border.neutral.bold,
  },
  optionList: {
    width: "100%",
    paddingTop: spacing[12],
    paddingHorizontal: spacing[16],
    gap: spacing[4],
  },
  option: {
    width: "100%",
    paddingVertical: spacing[16],
    paddingHorizontal: spacing[16],
    borderRadius: radius[16],
  },
  optionSelected: {
    backgroundColor: colors.surface.primary.subtlest,
  },
});
