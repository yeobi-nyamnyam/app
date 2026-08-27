import { Platform, StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, stroke, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'

/**
 * @param day 일차/날짜 텍스트 (예: "1일차 / 08.12")
 * @param totalBudget 하루 총 예산 텍스트 (예: "45,000원")
 * @param breakfast 아침 식비 텍스트 (예: "12,000원")
 * @param lunch 점심 식비 텍스트 (예: "15,000원")
 * @param dinner 저녁 식비 텍스트 (예: "18,000원")
 */
export interface DayCardProps {
  day: string
  totalBudget: string
  breakfast: string
  lunch: string
  dinner: string
}

const MealItem = ({ label, amount }: { label: string; amount: string }) => (
  <View style={styles.meal}>
    <Text style={styles.mealLabel}>{label}</Text>
    <Text style={styles.mealAmount}>{amount}</Text>
  </View>
)

export const DayCard = ({ day, totalBudget, breakfast, lunch, dinner }: DayCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{day}</Text>
        <Text style={styles.headerText}>{totalBudget}</Text>
      </View>
      <View style={styles.mealRow}>
        <MealItem label="아침" amount={breakfast} />
        <MealItem label="점심" amount={lunch} />
        <MealItem label="저녁" amount={dinner} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.surface.neutral.default,
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.default,
    borderRadius: radius[30],
    paddingHorizontal: spacing[20],
    paddingVertical: spacing[16],
    gap: spacing[10],
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: typography.bodyEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  mealRow: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing[10],
  },
  meal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[10],
    paddingVertical: spacing[8],
    borderRadius: radius[20],
    backgroundColor: colors.surface.neutral.default,
    shadowColor: colors.surface.neutral.inverse,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    ...Platform.select({ android: { elevation: 2 } }),
  },
  mealLabel: {
    fontFamily: getFontFamily(typography.subheadlineRegular.fontWeight),
    fontSize: typography.subheadlineRegular.fontSize,
    lineHeight: typography.subheadlineRegular.lineHeight,
    letterSpacing: typography.subheadlineRegular.letterSpacing,
    fontWeight: typography.subheadlineRegular.fontWeight,
    color: colors.content.neutral.default,
  },
  mealAmount: {
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: typography.bodyEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
})
