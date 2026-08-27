import type { ViewStyle } from 'react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, stroke, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'
import { Icon } from '../Icon'
import { Chip } from '../Chip'

export type MealWeight = '가볍게' | '보통' | '든든하게'

const WEIGHT_OPTIONS: MealWeight[] = ['가볍게', '보통', '든든하게']

export interface DayWeightMeal {
  key: string
  label: string
  amount: string
  weight: MealWeight
}

/**
 * @param title 카드 상단에 표시할 일차/날짜 텍스트 (예: "2일차 | 08.13")
 * @param dayBudget 해당 일자 총 예산 텍스트 (예: "45,000원")
 * @param meals 끼니별 정보 목록, 각 항목은 { key, label, amount, weight } (보통 아침/점심/저녁 3개)
 * @param expanded 펼침 상태인지: true | false (optional, 기본값 false, 접힌 상태에서는
 * 끼니별 요약 한 줄만 보여주고, 펼치면 끼니별 식사량 선택 Chip이 나타남)
 * @param active 현재 편집 대상으로 선택된 카드인지: true | false (optional, 기본값 false).
 * false면 테두리가 연하고 Chip이 비활성화된 채로 이전 선택값만 보여줌
 * @param onToggleExpanded 헤더를 클릭해 펼침/접힘을 토글할 때 발생하는 event 명시 (optional)
 * @param onChangeWeight 식사량 Chip을 선택할 때 발생하는 event 명시, 끼니의 key와 선택한
 * weight를 전달 (optional, active가 true일 때만 Chip이 눌림)
 */
export interface DayWeightSelectorProps {
  title: string
  dayBudget: string
  meals: DayWeightMeal[]
  expanded?: boolean
  active?: boolean
  onToggleExpanded?: () => void
  onChangeWeight?: (mealKey: string, weight: MealWeight) => void
}

type CardStateKey = 'collapsedInactive' | 'collapsedActive' | 'expandedInactive' | 'expandedActive'

const containerVariants: Record<CardStateKey, ViewStyle> = {
  collapsedInactive: {
    backgroundColor: colors.surface.neutral.subtlest,
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.default,
    gap: spacing[4],
  },
  collapsedActive: {
    backgroundColor: colors.surface.neutral.default,
    borderWidth: stroke.default,
    borderColor: colors.border.primary.default,
    gap: spacing[4],
  },
  expandedInactive: {
    backgroundColor: colors.surface.neutral.subtlest,
    borderWidth: stroke.focusRing,
    borderColor: colors.border.neutral.default,
    gap: spacing[10],
  },
  expandedActive: {
    backgroundColor: colors.surface.neutral.default,
    borderWidth: stroke.focusRing,
    borderColor: colors.border.primary.default,
    gap: spacing[10],
  },
}

export const DayWeightSelector = ({
  title,
  dayBudget,
  meals,
  expanded = false,
  active = false,
  onToggleExpanded,
  onChangeWeight,
}: DayWeightSelectorProps) => {
  const stateKey: CardStateKey = expanded
    ? active
      ? 'expandedActive'
      : 'expandedInactive'
    : active
      ? 'collapsedActive'
      : 'collapsedInactive'

  return (
    <View style={[styles.container, containerVariants[stateKey]]}>
      <Pressable style={styles.header} onPress={onToggleExpanded}>
        <Text style={styles.headerText} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerRight}>
          <Text style={styles.headerText}>{dayBudget}</Text>
          <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size="medium" />
        </View>
      </Pressable>

      {!expanded && (
        <View style={styles.summaryRow}>
          {meals.map((meal) => (
            <View key={meal.key} style={styles.summaryGroup}>
              <Text style={styles.summaryText}>{meal.label}</Text>
              <Text style={styles.summaryText}>{meal.amount}</Text>
            </View>
          ))}
        </View>
      )}

      {expanded &&
        meals.map((meal) => (
          <View key={meal.key} style={[styles.weightGroup, { gap: active ? spacing[8] : spacing[2] }]}>
            <View style={styles.mealRow}>
              <Text style={active ? styles.mealLabelActive : styles.mealLabelInactive}>
                {meal.label}
              </Text>
              <Text style={active ? styles.mealAmountActive : styles.mealAmountInactive}>
                {meal.amount}
              </Text>
            </View>
            <View style={styles.chipRow}>
              {WEIGHT_OPTIONS.map((option) => (
                <Chip
                  key={option}
                  text={option}
                  width="fill"
                  active={meal.weight === option}
                  disabled={!active}
                  onPress={active ? () => onChangeWeight?.(meal.key, option) : undefined}
                />
              ))}
            </View>
          </View>
        ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: radius[23],
    paddingHorizontal: spacing[20],
    paddingVertical: spacing[16],
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: typography.bodyEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  summaryRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[6],
  },
  summaryGroup: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  summaryText: {
    fontFamily: getFontFamily(typography.footnoteRegular.fontWeight),
    fontSize: typography.footnoteRegular.fontSize,
    lineHeight: typography.footnoteRegular.lineHeight,
    letterSpacing: typography.footnoteRegular.letterSpacing,
    fontWeight: typography.footnoteRegular.fontWeight,
    color: colors.content.neutral.default,
  },
  weightGroup: {
    width: '100%',
  },
  mealRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealLabelInactive: {
    fontFamily: getFontFamily(typography.subheadlineEmphasized.fontWeight),
    fontSize: typography.subheadlineEmphasized.fontSize,
    lineHeight: typography.subheadlineEmphasized.lineHeight,
    letterSpacing: typography.subheadlineEmphasized.letterSpacing,
    fontWeight: typography.subheadlineEmphasized.fontWeight,
    color: colors.content.neutral.disabled,
  },
  mealAmountInactive: {
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: typography.bodyEmphasized.fontWeight,
    color: colors.content.neutral.disabled,
  },
  mealLabelActive: {
    fontFamily: getFontFamily(typography.calloutEmphasized.fontWeight),
    fontSize: typography.calloutEmphasized.fontSize,
    lineHeight: typography.calloutEmphasized.lineHeight,
    letterSpacing: typography.calloutEmphasized.letterSpacing,
    fontWeight: typography.calloutEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  mealAmountActive: {
    fontFamily: getFontFamily(typography.calloutEmphasized.fontWeight),
    fontSize: typography.calloutEmphasized.fontSize,
    lineHeight: typography.calloutEmphasized.lineHeight,
    letterSpacing: typography.calloutEmphasized.letterSpacing,
    fontWeight: typography.calloutEmphasized.fontWeight,
    color: colors.content.primary.bold,
  },
  chipRow: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing[6],
  },
})
