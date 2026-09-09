import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'
import { Track } from '../Track'

/**
 * @param label 여행 이름(진행 중이면 "(진행)" 등 상태 표시 포함) 또는 "전체"
 * @param ratio 예산 대비 소비율(%). 100 초과 시 텍스트/막대가 error 색으로 바뀜
 * @param selected 현재 선택된 행인지: true | false (optional, 기본값 false) — 선택
 * 시 옅은 배경으로 강조됨
 * @param onPress 행을 클릭할 때 발생하는 event 명시 (optional)
 */
export interface BudgetRatioRowProps {
  label: string
  ratio: number
  selected?: boolean
  onPress?: () => void
}

export const BudgetRatioRow = ({ label, ratio, selected = false, onPress }: BudgetRatioRowProps) => {
  const isOver = ratio > 100

  return (
    <Pressable
      style={[styles.container, selected && styles.containerSelected]}
      onPress={onPress}
    >
      <View style={styles.labelRow}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.ratio, isOver && styles.ratioOver]}>{`${ratio}%`}</Text>
      </View>
      <Track progress={ratio} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing[4],
    padding: spacing[8],
    borderRadius: radius[10],
  },
  containerSelected: {
    backgroundColor: colors.surface.primary.subtlest,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[8],
  },
  label: {
    flex: 1,
    fontFamily: getFontFamily(typography.calloutRegular.fontWeight),
    fontSize: typography.calloutRegular.fontSize,
    lineHeight: typography.calloutRegular.lineHeight,
    letterSpacing: typography.calloutRegular.letterSpacing,
    fontWeight: typography.calloutRegular.fontWeight,
    color: colors.content.neutral.default,
  },
  ratio: {
    fontFamily: getFontFamily(typography.calloutEmphasized.fontWeight),
    fontSize: typography.calloutEmphasized.fontSize,
    lineHeight: typography.calloutEmphasized.lineHeight,
    letterSpacing: typography.calloutEmphasized.letterSpacing,
    fontWeight: typography.calloutEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  ratioOver: {
    color: colors.content.error.default,
  },
})
