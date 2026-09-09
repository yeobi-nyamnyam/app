import type { TextStyle, ViewStyle } from 'react-native'
import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'

export type BadgeVariant = 'grey' | 'sky' | 'slate' | 'success' | 'warning'

/**
 * @param label 배지에 표시할 텍스트
 * @param variant 배지의 색상: 'grey' | 'sky' | 'slate' | 'success' | 'warning' (optional, 기본값 'grey')
 */
export interface BadgeProps {
  label: string
  variant?: BadgeVariant
}

// success/warning은 완료 여행 목록(Figma node 410:2278)의 예산 준수 여부
// 태그 전용 색 — packages/tokens의 success/warn 계열이 이 용도로는 채도가
// 낮아(작은 텍스트에서 가독성 부족) Figma 실측값을 그대로 쓴다.
const containerVariants: Record<BadgeVariant, ViewStyle> = {
  grey: { backgroundColor: colors.surface.neutral.subtlest },
  sky: { backgroundColor: colors.surface.primary.subtlest },
  slate: { backgroundColor: colors.surface.primary.bold },
  success: { backgroundColor: '#edffe9' },
  warning: { backgroundColor: '#fff9f0' },
}

const labelVariants: Record<BadgeVariant, TextStyle> = {
  grey: { color: colors.content.neutral.subtle },
  sky: { color: colors.content.primary.bold },
  slate: { color: colors.content.neutral.inverse },
  success: { color: '#2d9713' },
  warning: { color: '#bf904d' },
}

export const Badge = ({ label, variant = 'grey' }: BadgeProps) => {
  return (
    <View style={[styles.container, containerVariants[variant]]}>
      <Text style={[styles.label, labelVariants[variant]]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
  },
  label: {
    fontFamily: getFontFamily(typography.footnoteRegular.fontWeight),
    fontSize: typography.footnoteRegular.fontSize,
    lineHeight: typography.footnoteRegular.lineHeight,
    letterSpacing: typography.footnoteRegular.letterSpacing,
    fontWeight: typography.footnoteRegular.fontWeight,
  },
})
