import type { TextStyle, ViewStyle } from 'react-native'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, stroke, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'
import { AlertSign } from './AlertSign'

export type AlertVariant = 'warn' | 'error' | 'info'

/**
 * @param title 알림 제목
 * @param content 알림 본문 텍스트 (optional)
 * @param variant 알림 종류: 'warn' | 'error' | 'info' (optional, 기본값 'warn').
 * 왼쪽에 종류에 맞는 경고/에러/정보 아이콘이 함께 표시됨
 */
export interface AlertProps {
  title: string
  content?: string
  variant?: AlertVariant
}

const containerVariants: Record<AlertVariant, ViewStyle> = {
  warn: {
    backgroundColor: colors.surface.warn.default,
    borderColor: colors.border.warn.default,
  },
  error: {
    backgroundColor: colors.surface.error.default,
    borderColor: colors.border.error.default,
  },
  info: {
    backgroundColor: colors.surface.primary.subtlest,
    borderColor: colors.border.primary.default,
  },
}

const titleColorVariants: Record<AlertVariant, TextStyle> = {
  warn: { color: colors.content.warn.default },
  error: { color: colors.content.error.default },
  info: { color: colors.content.primary.strong },
}

export const Alert = ({ title, content, variant = 'warn' }: AlertProps) => {
  return (
    <View style={[styles.container, containerVariants[variant]]}>
      <AlertSign variant={variant} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, titleColorVariants[variant]]}>{title}</Text>
        </View>
        {content ? <Text style={styles.content}>{content}</Text> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing[8],
    borderWidth: stroke.hairline,
    borderRadius: radius[23],
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    backgroundColor: colors.surface.neutral.default,
    shadowColor: colors.surface.neutral.inverse,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...Platform.select({ android: { elevation: 3 } }),
  },
  body: {
    flex: 1,
    gap: spacing[2],
  },
  titleRow: {
    width: '100%',
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
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
