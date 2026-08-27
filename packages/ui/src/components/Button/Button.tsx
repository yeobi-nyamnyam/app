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

// 이 Button은 누르는 즉시 동작이 끝나고 다른 화면/상태로 넘어가는 "일회성 액션"
// 버튼이라, 눌렀다는 시각 피드백(색 변화)을 따로 주지 않고 항상 default 모양을
// 유지한다. 계속 선택된 상태를 보여줘야 하는 버튼(예: 토글)은 이 컴포넌트가 아니라
// 별도 컴포넌트로 다뤄야 한다.
type StateKey = 'default' | 'disabled'

const containerVariants: Record<ButtonVariant, Record<StateKey, ViewStyle>> = {
  primary: {
    default: { backgroundColor: colors.surface.primary.default },
    disabled: { backgroundColor: colors.surface.primary.disabled },
  },
  outline: {
    default: {
      backgroundColor: 'transparent',
      borderWidth: stroke.default,
      borderColor: colors.border.primary.default,
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
    disabled: { color: colors.content.neutral.disabled },
  },
  outline: {
    default: { color: colors.content.neutral.default },
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
  const stateKey: StateKey = disabled ? 'disabled' : 'default'
  return (
    <Pressable onPress={disabled ? undefined : onPress} disabled={disabled}>
      <View style={[styles.container, containerVariants[variant][stateKey]]}>
        {variant === 'primary' && icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text style={[styles.label, labelVariants[variant][stateKey]]}>{label}</Text>
      </View>
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
    paddingHorizontal: spacing[24],
    gap: spacing[8],
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
