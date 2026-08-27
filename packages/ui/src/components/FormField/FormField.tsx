import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'

/**
 * @param label 필드 위에 표시할 라벨 텍스트
 * @param children 라벨 아래에 표시할 실제 입력 요소 (예: TextField, Chip 목록, Button 등)
 */
export interface FormFieldProps {
  label: string
  children: ReactNode
}

export const FormField = ({ label, children }: FormFieldProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
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
    fontFamily: getFontFamily(typography.subheadlineEmphasized.fontWeight),
    fontSize: typography.subheadlineEmphasized.fontSize,
    lineHeight: typography.subheadlineEmphasized.lineHeight,
    letterSpacing: typography.subheadlineEmphasized.letterSpacing,
    fontWeight: typography.subheadlineEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
})
