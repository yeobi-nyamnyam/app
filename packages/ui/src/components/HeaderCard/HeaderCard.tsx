import type { ViewStyle } from 'react-native'
import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'

export type HeaderCardState = 'default' | 'plus' | 'minus'

/**
 * @param title 카드 상단에 표시할 제목 텍스트 (예: "친구들과 대구 여행 | 2일차")
 * @param consumed 오늘 사용한 식비 금액 텍스트 (예: "12,000원")
 * @param dayBudget 하루 예산 금액 텍스트 (예: "45,000원")
 * @param extraBudget 여유/초과 식비 금액 텍스트, state가 'plus' 또는 'minus'일 때만 표시됨 (optional)
 * @param state 카드 상태: 'default' | 'plus' | 'minus' (optional, 기본값 'default').
 * 'plus'는 여유 식비(주황) 박스, 'minus'는 초과 식비(빨강) 박스를 하단에 추가로 보여준다
 */
export interface HeaderCardProps {
  title: string
  consumed: string
  dayBudget: string
  extraBudget?: string
  state?: HeaderCardState
}

const containerGapVariants: Record<HeaderCardState, ViewStyle> = {
  default: { gap: spacing[10] },
  plus: { gap: spacing[6] },
  minus: { gap: spacing[6] },
}

const surplusBoxVariants: Record<
  HeaderCardState,
  { label: string; sign: string; color: string } | null
> = {
  default: null,
  plus: { label: '여유 식비', sign: '+', color: colors.content.warn.default },
  minus: { label: '초과 식비', sign: '-', color: colors.content.error.default },
}

export const HeaderCard = ({
  title,
  consumed,
  dayBudget,
  extraBudget,
  state = 'default',
}: HeaderCardProps) => {
  const surplus = surplusBoxVariants[state]

  return (
    <View style={[styles.container, containerGapVariants[state]]}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View>
        <Text style={styles.consumedLabel}>오늘 식비 사용량</Text>
        <Text style={styles.consumedValue}>{consumed}</Text>
      </View>
      <View style={styles.budgetRow}>
        <Text style={styles.budgetText}>일 예산</Text>
        <Text style={styles.budgetText}>{dayBudget}</Text>
      </View>
      {surplus && (
        <View style={styles.surplusBox}>
          <Text style={styles.surplusLabel}>{surplus.label}</Text>
          <Text style={[styles.surplusAmount, { color: surplus.color }]}>
            {surplus.sign}
            {extraBudget}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.surface.primary.strong,
    borderRadius: radius[30],
    paddingHorizontal: spacing[24],
    paddingVertical: spacing[20],
    overflow: 'hidden',
  },
  title: {
    fontFamily: getFontFamily(typography.title3Emphasized.fontWeight),
    fontSize: typography.title3Emphasized.fontSize,
    lineHeight: typography.title3Emphasized.lineHeight,
    letterSpacing: typography.title3Emphasized.letterSpacing,
    fontWeight: typography.title3Emphasized.fontWeight,
    color: colors.content.neutral.inverse,
  },
  consumedLabel: {
    fontFamily: getFontFamily(typography.subheadlineRegular.fontWeight),
    fontSize: typography.subheadlineRegular.fontSize,
    lineHeight: typography.subheadlineRegular.lineHeight,
    letterSpacing: typography.subheadlineRegular.letterSpacing,
    fontWeight: typography.subheadlineRegular.fontWeight,
    color: colors.content.neutral.inverse,
  },
  consumedValue: {
    fontFamily: getFontFamily(typography.title1Bold.fontWeight),
    fontSize: typography.title1Bold.fontSize,
    lineHeight: typography.title1Bold.lineHeight,
    letterSpacing: typography.title1Bold.letterSpacing,
    fontWeight: typography.title1Bold.fontWeight,
    color: colors.content.neutral.inverse,
  },
  budgetRow: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  budgetText: {
    fontFamily: getFontFamily(typography.bodyRegular.fontWeight),
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    fontWeight: typography.bodyRegular.fontWeight,
    color: colors.content.neutral.inverse,
  },
  surplusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface.neutral.alpha['alpha-10'],
    borderRadius: radius[20],
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
  },
  surplusLabel: {
    fontFamily: getFontFamily(typography.calloutRegular.fontWeight),
    fontSize: typography.calloutRegular.fontSize,
    lineHeight: typography.calloutRegular.lineHeight,
    letterSpacing: typography.calloutRegular.letterSpacing,
    fontWeight: typography.calloutRegular.fontWeight,
    color: colors.content.neutral.inverse,
  },
  surplusAmount: {
    fontFamily: getFontFamily(typography.calloutEmphasized.fontWeight),
    fontSize: typography.calloutEmphasized.fontSize,
    lineHeight: typography.calloutEmphasized.lineHeight,
    letterSpacing: typography.calloutEmphasized.letterSpacing,
    fontWeight: typography.calloutEmphasized.fontWeight,
  },
})
