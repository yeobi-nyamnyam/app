import type { TextStyle, ViewStyle } from 'react-native'
import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'

export type BadgeVariant = 'grey' | 'sky' | 'slate'

/**
 * @param label 배지에 표시할 텍스트
 * @param variant 배지의 색상: 'grey' | 'sky' | 'slate' (optional, 기본값 'grey')
 */
export interface BadgeProps {
  label: string
  variant?: BadgeVariant
}

const containerVariants: Record<BadgeVariant, ViewStyle> = {
  grey: { backgroundColor: colors.surface.neutral.subtlest },
  sky: { backgroundColor: colors.surface.primary.subtlest },
  slate: { backgroundColor: colors.surface.primary.bold },
}

const labelVariants: Record<BadgeVariant, TextStyle> = {
  grey: { color: colors.content.neutral.subtle },
  sky: { color: colors.content.primary.bold },
  slate: { color: colors.content.neutral.inverse },
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
