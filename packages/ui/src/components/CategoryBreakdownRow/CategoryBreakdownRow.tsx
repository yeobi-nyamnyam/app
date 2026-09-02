import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'

/**
 * @param label 카테고리명 (예: "식비", "교통")
 * @param amount 표시할 금액 텍스트, 포맷 완료된 값 (예: "57,600원")
 * @param percent 전체 대비 비중(%)
 * @param dotColor 좌측 색상 점의 색상(hex)
 */
export interface CategoryBreakdownRowProps {
  label: string
  amount: string
  percent: number
  dotColor: string
}

export const CategoryBreakdownRow = ({ label, amount, percent, dotColor }: CategoryBreakdownRowProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{amount}</Text>
        <Text style={styles.percent}>{`${percent}%`}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[6],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontFamily: getFontFamily(typography.calloutRegular.fontWeight),
    fontSize: typography.calloutRegular.fontSize,
    lineHeight: typography.calloutRegular.lineHeight,
    letterSpacing: typography.calloutRegular.letterSpacing,
    fontWeight: typography.calloutRegular.fontWeight,
    color: colors.content.neutral.default,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[6],
  },
  amount: {
    fontFamily: getFontFamily(typography.calloutEmphasized.fontWeight),
    fontSize: typography.calloutEmphasized.fontSize,
    lineHeight: typography.calloutEmphasized.lineHeight,
    letterSpacing: typography.calloutEmphasized.letterSpacing,
    fontWeight: typography.calloutEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  percent: {
    fontFamily: getFontFamily(typography.footnoteRegular.fontWeight),
    fontSize: typography.footnoteRegular.fontSize,
    lineHeight: typography.footnoteRegular.lineHeight,
    letterSpacing: typography.footnoteRegular.letterSpacing,
    fontWeight: typography.footnoteRegular.fontWeight,
    color: colors.content.neutral.subtle,
  },
})
