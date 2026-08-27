import type { ReactNode } from 'react'
import type { TextStyle, ViewStyle } from 'react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, icon as iconSize, radius, spacing, stroke, typography } from '@repo/tokens'

export type ButtonVariant = 'primary' | 'outline'

/**
 * @param label 버튼에 표시할 텍스트
 * @param variant 버튼의 종류: 'primary' | 'outline' (optional, 기본값 'primary')
 * @param disabled 버튼이 비활성화 상태인지: true | false (optional, 기본값 false)
 * @param icon 버튼 왼쪽에 표시할 아이콘 (optional, variant가 'primary'일 때만 렌더링)
 * @param onPress 버튼을 클릭할 때 발생하는 event 명시 (optional)
 */
export interface ButtonProps {
  label: string
  variant?: ButtonVariant
  disabled?: boolean
  icon?: ReactNode
  onPress?: () => void
}

type StateKey = 'default' | 'pressed' | 'disabled'

const stateKeyOf = (disabled: boolean, pressed: boolean): StateKey =>
  disabled ? 'disabled' : pressed ? 'pressed' : 'default'

const containerVariants: Record<ButtonVariant, Record<StateKey, ViewStyle>> = {
  primary: {
    default: { backgroundColor: colors.surface.primary.default },
    pressed: { backgroundColor: colors.surface.primary.active },
    disabled: { backgroundColor: colors.surface.primary.disabled },
  },
  outline: {
    default: {
      backgroundColor: 'transparent',
      borderWidth: stroke.default,
      borderColor: colors.border.primary.default,
    },
    pressed: {
      backgroundColor: 'transparent',
      borderWidth: stroke.focusRing,
      borderColor: colors.border.primary.bold,
    },
    disabled: {
      backgroundColor: 'transparent',
      borderWidth: stroke.default,
      borderColor: colors.border.neutral.default,
    },
  },
}

const labelVariants: Record<ButtonVariant, Record<StateKey, TextStyle>> = {
  primary: {
    default: { color: colors.content.neutral.inverse },
    pressed: { color: colors.content.neutral.inverse },
    disabled: { color: colors.content.neutral.disabled },
  },
  outline: {
    default: { color: colors.content.neutral.default },
    pressed: { color: colors.content.neutral.default },
    disabled: { color: colors.content.neutral.disabled },
  },
}

export const Button = ({
  label,
  variant = 'primary',
  disabled = false,
  icon,
  onPress,
}: ButtonProps) => {
  return (
    <Pressable onPress={disabled ? undefined : onPress} disabled={disabled}>
      {({ pressed }) => {
        const stateKey = stateKeyOf(disabled, pressed)
        return (
          <View style={[styles.container, containerVariants[variant][stateKey]]}>
            {variant === 'primary' && icon ? <View style={styles.icon}>{icon}</View> : null}
            <Text style={[styles.label, labelVariants[variant][stateKey]]}>{label}</Text>
          </View>
        )
      }}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[600],
    gap: spacing[200],
  },
  icon: {
    width: iconSize.small,
    height: iconSize.small,
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    fontWeight: typography.bodyRegular.fontWeight,
  },
})
