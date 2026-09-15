import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, stroke, typography } from '@repo/tokens'

/**
 * @param title 카드 제목 (optional, 없으면 설명 텍스트만 표시)
 * @param description 제목 아래 설명 텍스트
 * @param buttonLabel 하단 버튼에 표시할 텍스트
 * @param disabled 버튼이 비활성화된 것처럼 보이는지: true | false — 스타일만 바꾸고
 * onPress는 그대로 동작한다. 눌렀을 때 안내 모달 등을 띄워야 하는 경우에 사용
 * (optional, 기본값 false)
 * @param onPress 버튼을 클릭할 때 발생하는 event 명시
 */
export interface CTACardProps {
  title?: string
  description: string
  buttonLabel: string
  disabled?: boolean
  onPress?: () => void
}

export const CTACard = ({ title, description, buttonLabel, disabled = false, onPress }: CTACardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <Text style={styles.description}>{description}</Text>
      </View>
      <Pressable style={[styles.button, disabled && styles.buttonDisabled]} onPress={onPress}>
        <Text style={[styles.buttonLabel, disabled && styles.buttonLabelDisabled]}>{buttonLabel}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: spacing[14],
    borderRadius: radius[30],
    borderWidth: stroke.hairline,
    borderColor: colors.border.neutral.default,
    backgroundColor: colors.surface.neutral.default,
  },
  textBlock: {
    paddingTop: spacing[8],
    paddingBottom: spacing[24],
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.title3Emphasized.fontSize,
    lineHeight: typography.title3Emphasized.lineHeight,
    letterSpacing: typography.title3Emphasized.letterSpacing,
    fontWeight: typography.title3Emphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  description: {
    fontFamily: typography.fontFamily,
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    fontWeight: typography.bodyRegular.fontWeight,
    color: colors.content.neutral.default,
  },
  button: {
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.primary.default,
  },
  buttonDisabled: {
    backgroundColor: colors.surface.primary.disabled,
  },
  buttonLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    fontWeight: typography.bodyRegular.fontWeight,
    color: colors.content.neutral.inverse,
  },
  buttonLabelDisabled: {
    color: colors.content.neutral.disabled,
  },
})
