import type { TextStyle, ViewStyle } from 'react-native'
import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, stroke, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'

export type NoticeVariant = 'grey' | 'yellow' | 'sky'

/**
 * @param title 안내 상단에 굵게 표시할 제목 (optional)
 * @param content 안내 본문 텍스트 (optional)
 * @param variant 안내 색상: 'grey' | 'yellow' | 'sky' (optional, 기본값 'grey')
 */
export interface NoticeProps {
  title?: string
  content?: string
  variant?: NoticeVariant
}

const containerVariants: Record<NoticeVariant, ViewStyle> = {
  grey: {
    backgroundColor: colors.surface.neutral.subtle,
    borderColor: colors.border.neutral.default,
  },
  yellow: {
    backgroundColor: colors.surface.warn.default,
    borderColor: colors.border.warn.default,
  },
  sky: {
    backgroundColor: colors.surface.primary.subtlest,
    borderColor: colors.border.primary.default,
  },
}

const titleColorVariants: Record<NoticeVariant, TextStyle> = {
  grey: { color: colors.content.neutral.default },
  yellow: { color: colors.content.warn.default },
  sky: { color: colors.content.primary.strong },
}

export const Notice = ({ title, content, variant = 'grey' }: NoticeProps) => {
  return (
    <View style={[styles.container, containerVariants[variant]]}>
      {title ? <Text style={[styles.title, titleColorVariants[variant]]}>{title}</Text> : null}
      {content ? <Text style={styles.content}>{content}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: stroke.hairline,
    borderRadius: radius[23],
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    gap: spacing[2],
  },
  title: {
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: typography.bodyEmphasized.fontWeight,
  },
  content: {
    fontFamily: getFontFamily(typography.bodyRegular.fontWeight),
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    fontWeight: typography.bodyRegular.fontWeight,
    color: colors.content.neutral.default,
  },
})
