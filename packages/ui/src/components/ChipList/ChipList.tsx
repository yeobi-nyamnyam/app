import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'
import { Chip } from '../Chip'

export interface ChipListOption {
  label: string
  value: string
}

/**
 * @param label 칩 그룹 왼쪽에 표시할 라벨 텍스트
 * @param options 선택지 목록, 각 항목은 { label, value }
 * @param value 현재 선택된 항목의 value
 * @param onChange 항목을 선택할 때 발생하는 event 명시, 선택한 value를 전달
 * @param disabled 칩 그룹 전체가 비활성화 상태인지: true | false (optional, 기본값 false)
 */
export interface ChipListProps {
  label: string
  options: ChipListOption[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export const ChipList = ({ label, options, value, onChange, disabled = false }: ChipListProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollArea}
        contentContainerStyle={styles.chipRow}
      >
        {options.map((option) => (
          <Chip
            key={option.value}
            text={option.label}
            width="hug"
            active={value === option.value}
            disabled={disabled}
            onPress={() => onChange(option.value)}
          />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[10],
  },
  label: {
    flexShrink: 0,
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: typography.bodyEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  scrollArea: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing[10],
  },
})
