import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Icon, Text, colors, radius, spacing, stroke } from "@repo/ui";

export interface TripSelectOption {
  id: string;
  label: string;
  endDateLabel: string;
}

/**
 * @param options 선택지 목록, 각 항목은 { id, label, endDateLabel }
 * @param selectedId 현재 선택된 항목의 id
 * @param onChange 항목을 선택할 때 발생하는 event 명시, 선택한 id를 전달
 */
export interface TripSelectDropdownProps {
  options: TripSelectOption[];
  selectedId: string;
  onChange: (id: string) => void;
}

// 소비 습관 대시보드(M1) 전용 여행 선택 드롭다운. 별도 모달/바텀시트 없이 트리거
// 바로 아래에 목록이 펼쳐지는 인라인 드롭다운(DateRangeField류의 필드 스타일 재사용).
export const TripSelectDropdown = ({ options, selectedId, onChange }: TripSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.id === selectedId);

  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.trigger} onPress={() => setIsOpen((prev) => !prev)}>
        <Text variant="bodyEmphasized">{selected?.label ?? "여행을 선택하세요"}</Text>
        <Icon name={isOpen ? "chevron-up" : "chevron-down"} size="small" color={colors.content.neutral.subtle} />
      </Pressable>
      {isOpen ? (
        <View style={styles.panel}>
          {options.map((option) => {
            const isSelected = option.id === selectedId;
            return (
              <Pressable
                key={option.id}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
              >
                <Text variant="calloutRegular" numberOfLines={1}>
                  {option.label}
                </Text>
                <Text variant="footnoteRegular" color="subtle">
                  {option.endDateLabel}
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
  wrapper: {
    width: "100%",
  },
  trigger: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[8],
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[10],
    borderRadius: radius[10],
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.default,
    backgroundColor: colors.surface.neutral.default,
  },
  panel: {
    width: "100%",
    marginTop: spacing[4],
    borderRadius: radius[10],
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.default,
    backgroundColor: colors.surface.neutral.default,
    overflow: "hidden",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[8],
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[10],
  },
  optionSelected: {
    backgroundColor: colors.surface.primary.subtlest,
  },
});
