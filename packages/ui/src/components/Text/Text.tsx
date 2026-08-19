import type { ReactNode } from 'react'
import type { TextStyle } from 'react-native'
import { StyleSheet, Text as RNText } from 'react-native'
import { colors, typography } from '@repo/tokens'

export type TextVariant = Exclude<keyof typeof typography, 'fontFamily'>

export type TextColor =
  | 'default'
  | 'subtle'
  | 'subtlest'
  | 'disabled'
  | 'inverse'
  | 'error'
  | 'warn'
  | 'success'

/**
 * @param children 표시할 텍스트 내용
 * @param variant 타이포그래피 종류: 'title1Bold' | 'title2Bold' | 'title3Regular' | 'title3Emphasized' |
 * 'headlineRegular' | 'headlineEmphasized' | 'bodyRegular' | 'bodyEmphasized' | 'calloutRegular' |
 * 'calloutEmphasized' | 'subheadlineRegular' | 'subheadlineEmphasized' | 'footnoteRegular' |
 * 'footnoteEmphasized' (optional, 기본값 'bodyRegular')
 * @param color 텍스트 색상: 'default' | 'subtle' | 'subtlest' | 'disabled' | 'inverse' | 'error' | 'warn' |
 * 'success' (optional, 기본값 'default')
 * @param numberOfLines 최대 표시 줄 수, 넘치는 텍스트는 말줄임표(...) 처리 (optional)
 */
export interface TextProps {
  children: ReactNode
  variant?: TextVariant
  color?: TextColor
  numberOfLines?: number
}

const typographyVariants: Record<TextVariant, TextStyle> = {
  title1Bold: typography.title1Bold,
  title2Bold: typography.title2Bold,
  title3Regular: typography.title3Regular,
  title3Emphasized: typography.title3Emphasized,
  headlineRegular: typography.headlineRegular,
  headlineEmphasized: typography.headlineEmphasized,
  bodyRegular: typography.bodyRegular,
  bodyEmphasized: typography.bodyEmphasized,
  calloutRegular: typography.calloutRegular,
  calloutEmphasized: typography.calloutEmphasized,
  subheadlineRegular: typography.subheadlineRegular,
  subheadlineEmphasized: typography.subheadlineEmphasized,
  footnoteRegular: typography.footnoteRegular,
  footnoteEmphasized: typography.footnoteEmphasized,
}

const colorVariants: Record<TextColor, TextStyle> = {
  default: { color: colors.content.neutral.default },
  subtle: { color: colors.content.neutral.subtle },
  subtlest: { color: colors.content.neutral.subtlest },
  disabled: { color: colors.content.neutral.disabled },
  inverse: { color: colors.content.neutral.inverse },
  error: { color: colors.content.error.default },
  warn: { color: colors.content.warn.default },
  success: { color: colors.content.success.default },
}

export const Text = ({
  children,
  variant = 'bodyRegular',
  color = 'default',
  numberOfLines,
}: TextProps) => {
  return (
    <RNText
      style={[styles.base, typographyVariants[variant], colorVariants[color]]}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  )
}

const styles = StyleSheet.create({
  base: {
    fontFamily: typography.fontFamily,
  },
})
