import type { ViewStyle } from 'react-native'
import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, stroke, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'
import { Badge, type BadgeVariant } from '../Badge'

export type MealCardState = 'pending' | 'active' | 'done'

/**
 * @param meal 끼니 이름 (예: "아침", "점심", "저녁")
 * @param budget 예산 또는 사용 금액 텍스트 (예: "12,000원")
 * @param state 카드 상태: 'pending' | 'active' | 'done' (optional, 기본값 'pending').
 * 'pending'은 아직 기록 전, 'active'는 지금 기록할 끼니(테두리 강조), 'done'은 기록 완료
 * @param showExcess 예산 초과 문구를 표시할지: true | false. state가 'done'일 때만
 * 의미가 있음 (optional, 기본값 false)
 */
export interface MealCardProps {
  meal: string
  budget: string
  state?: MealCardState
  showExcess?: boolean
}

const containerVariants: Record<MealCardState, ViewStyle> = {
  pending: { borderWidth: stroke.default, borderColor: colors.border.neutral.default },
  active: { borderWidth: stroke.focusRing, borderColor: colors.border.primary.default },
  done: { borderWidth: stroke.default, borderColor: colors.border.neutral.default },
}

const badgeVariants: Record<MealCardState, { label: string; variant: BadgeVariant }> = {
  pending: { label: '아직 기록 전', variant: 'grey' },
  active: { label: '기록하기', variant: 'sky' },
  done: { label: '기록 완료', variant: 'slate' },
}

export const MealCard = ({ meal, budget, state = 'pending', showExcess = false }: MealCardProps) => {
  const badge = badgeVariants[state]
  const isDone = state === 'done'

  return (
    <View style={[styles.container, containerVariants[state]]}>
      <View style={styles.row}>
        <Text style={styles.meal} numberOfLines={1}>
          {meal}
        </Text>
        <Badge label={badge.label} variant={badge.variant} />
      </View>
      <View style={styles.budgetRow}>
        <View style={styles.budgetGroup}>
          {isDone ? (
            <>
              <Text style={styles.budgetText}>{budget}</Text>
              <Text style={styles.budgetText}>사용</Text>
            </>
          ) : (
            <>
              <Text style={styles.budgetText}>예산</Text>
              <Text style={styles.budgetText}>{budget}</Text>
            </>
          )}
        </View>
        {isDone && showExcess && <Text style={styles.excessText}>(예산 초과)</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.surface.neutral.default,
    borderRadius: radius[23],
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    gap: spacing[4],
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meal: {
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: typography.bodyEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  budgetGroup: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  budgetText: {
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: typography.bodyEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  excessText: {
    fontFamily: getFontFamily(typography.footnoteRegular.fontWeight),
    fontSize: typography.footnoteRegular.fontSize,
    lineHeight: typography.footnoteRegular.lineHeight,
    letterSpacing: typography.footnoteRegular.letterSpacing,
    fontWeight: typography.footnoteRegular.fontWeight,
    color: colors.content.error.default,
  },
})
