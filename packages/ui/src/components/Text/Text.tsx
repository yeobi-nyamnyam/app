import type { ReactNode } from 'react'
import type { TextStyle } from 'react-native'
import { Text as RNText } from 'react-native'
import { colors, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'

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

export type TextAlign = 'left' | 'center'

/**
 * @param children 표시할 텍스트 내용
 * @param variant 타이포그래피 종류: 'title1Bold' | 'title2Bold' | 'title3Regular' | 'title3Emphasized' |
 * 'headlineRegular' | 'headlineEmphasized' | 'bodyRegular' | 'bodyEmphasized' | 'calloutRegular' |
 * 'calloutEmphasized' | 'subheadlineRegular' | 'subheadlineEmphasized' | 'footnoteRegular' |
 * 'footnoteEmphasized' (optional, 기본값 'bodyRegular')
 * @param color 텍스트 색상: 'default' | 'subtle' | 'subtlest' | 'disabled' | 'inverse' | 'error' | 'warn' |
 * 'success' (optional, 기본값 'default')
 * @param align 텍스트 정렬: 'left' | 'center' (optional, 기본값 'left')
 * @param numberOfLines 최대 표시 줄 수, 넘치는 텍스트는 말줄임표(...) 처리 (optional)
 */
export interface TextProps {
  children: ReactNode
  variant?: TextVariant
  color?: TextColor
  align?: TextAlign
  numberOfLines?: number
}

const withFontFamily = (variant: TextStyle): TextStyle => ({
  ...variant,
  fontFamily: getFontFamily(variant.fontWeight as string),
})

const typographyVariants: Record<TextVariant, TextStyle> = {
  title1Bold: withFontFamily(typography.title1Bold),
  title2Bold: withFontFamily(typography.title2Bold),
  title3Regular: withFontFamily(typography.title3Regular),
  title3Emphasized: withFontFamily(typography.title3Emphasized),
  headlineRegular: withFontFamily(typography.headlineRegular),
  headlineEmphasized: withFontFamily(typography.headlineEmphasized),
  bodyRegular: withFontFamily(typography.bodyRegular),
  bodyEmphasized: withFontFamily(typography.bodyEmphasized),
  calloutRegular: withFontFamily(typography.calloutRegular),
  calloutEmphasized: withFontFamily(typography.calloutEmphasized),
  subheadlineRegular: withFontFamily(typography.subheadlineRegular),
  subheadlineEmphasized: withFontFamily(typography.subheadlineEmphasized),
  footnoteRegular: withFontFamily(typography.footnoteRegular),
  footnoteEmphasized: withFontFamily(typography.footnoteEmphasized),
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
  align = 'left',
  numberOfLines,
}: TextProps) => {
  return (
    <RNText
      style={[typographyVariants[variant], colorVariants[color], { textAlign: align }]}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  )
}
