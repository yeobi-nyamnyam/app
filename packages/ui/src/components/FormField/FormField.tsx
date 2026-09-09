import type { ReactNode } from 'react'
import type { TextStyle } from 'react-native'
import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'

export type FormFieldLabelSize = 'default' | 'large'

/**
 * @param label 필드 위에 표시할 라벨 텍스트
 * @param labelSize 라벨 텍스트 크기: 'default' | 'large' (optional, 기본값 'default')
 * @param children 라벨 아래에 표시할 실제 입력 요소 (예: TextField, Chip 목록, Button 등)
 */
export interface FormFieldProps {
  label: string
  labelSize?: FormFieldLabelSize
  children: ReactNode
}

interface LabelTypography {
  fontSize: number
  fontWeight: TextStyle['fontWeight']
  lineHeight: number
  letterSpacing: number
}

const labelTypography: Record<FormFieldLabelSize, LabelTypography> = {
  default: typography.subheadlineEmphasized,
  large: typography.bodyEmphasized,
}

export const FormField = ({ label, labelSize = 'default', children }: FormFieldProps) => {
  const variant = labelTypography[labelSize]

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          {
            fontFamily: getFontFamily(variant.fontWeight as string),
            fontSize: variant.fontSize,
            lineHeight: variant.lineHeight,
            letterSpacing: variant.letterSpacing,
            fontWeight: variant.fontWeight,
          },
        ]}
      >
        {label}
      </Text>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing[4],
  },
  label: {
    color: colors.content.neutral.default,
  },
})
