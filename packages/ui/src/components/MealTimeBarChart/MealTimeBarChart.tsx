import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'

const MAX_BAR_HEIGHT = 140
const MIN_BAR_HEIGHT = 4

export interface MealTimeBarItem {
  label: string
  value: number
  valueLabel: string
}

/**
 * @param items 끼니 시간대 3개(아침/점심/저녁)의 { label, value, valueLabel }.
 * value는 막대 높이 계산에 쓰이는 원본 숫자, valueLabel은 막대 위에 표시할 텍스트
 */
export interface MealTimeBarChartProps {
  items: [MealTimeBarItem, MealTimeBarItem, MealTimeBarItem]
}

export const MealTimeBarChart = ({ items }: MealTimeBarChartProps) => {
  const maxValue = Math.max(...items.map((item) => item.value), 1)

  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const barHeight = item.value > 0 ? Math.max((item.value / maxValue) * MAX_BAR_HEIGHT, MIN_BAR_HEIGHT) : 0

        return (
          <View key={index} style={styles.column}>
            <Text style={styles.valueLabel}>{item.valueLabel}</Text>
            <View style={[styles.bar, { height: barHeight }]} />
            <Text style={styles.label}>{item.label}</Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[12],
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[6],
  },
  bar: {
    width: '100%',
    borderRadius: radius[7],
    backgroundColor: colors.surface.primary.default,
  },
  valueLabel: {
    fontFamily: getFontFamily(typography.footnoteEmphasized.fontWeight),
    fontSize: typography.footnoteEmphasized.fontSize,
    lineHeight: typography.footnoteEmphasized.lineHeight,
    letterSpacing: typography.footnoteEmphasized.letterSpacing,
    fontWeight: typography.footnoteEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  label: {
    fontFamily: getFontFamily(typography.footnoteRegular.fontWeight),
    fontSize: typography.footnoteRegular.fontSize,
    lineHeight: typography.footnoteRegular.lineHeight,
    letterSpacing: typography.footnoteRegular.letterSpacing,
    fontWeight: typography.footnoteRegular.fontWeight,
    color: colors.content.neutral.subtle,
  },
})
