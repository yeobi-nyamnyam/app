import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon, TextField, colors, getFontFamily, radius, spacing, stroke, typography } from "@repo/ui";

export interface DropdownOption {
  label: string;
  value: string;
}

/**
 * @param placeholder 값이 없을 때 표시할 안내 텍스트
 * @param options 선택지 목록
 * @param value 현재 선택된 항목의 value
 * @param onChange 항목을 선택할 때 발생하는 event 명시, 선택한 value를 전달
 */
export interface DropdownFieldProps {
  placeholder: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * 입력 필드를 누르면 바로 아래에 옵션 목록이 펼쳐지는 인라인 드롭다운.
 * (모달/바텀시트로 따로 뜨지 않고 폼 흐름 안에서 이어진다)
 */
export const DropdownField = ({ placeholder, options, value, onChange }: DropdownFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? "";

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setIsOpen((prev) => !prev)}>
        <View pointerEvents="none">
          <TextField
            value={selectedLabel}
            onChangeText={() => {}}
            placeholder={placeholder}
            tailingIcon={<Icon name={isOpen ? "chevron-up" : "chevron-down"} size="medium" />}
          />
        </View>
      </Pressable>

      {isOpen ? (
        <View style={styles.menu}>
          {options.map((option, index) => {
            const selected = option.value === value;
            return (
              <Pressable
                key={option.value}
                style={[styles.menuItem, index > 0 && styles.menuItemDivider]}
                onPress={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <Text style={[styles.menuItemLabel, selected && styles.menuItemLabelSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  menu: {
    marginTop: spacing[4],
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.default,
    borderRadius: radius[10],
    backgroundColor: colors.surface.neutral.default,
    overflow: "hidden",
  },
  menuItem: {
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[12],
  },
  menuItemDivider: {
    borderTopWidth: stroke.default,
    borderTopColor: colors.border.neutral.subtle,
  },
  menuItemLabel: {
    fontFamily: getFontFamily(typography.bodyRegular.fontWeight),
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    fontWeight: typography.bodyRegular.fontWeight,
    color: colors.content.neutral.default,
  },
  menuItemLabelSelected: {
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
    fontWeight: typography.bodyEmphasized.fontWeight,
    color: colors.content.primary.bold,
  },
});
