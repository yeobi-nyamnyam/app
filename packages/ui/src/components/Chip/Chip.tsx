import type { TextStyle, ViewStyle } from 'react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, stroke, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'

export type ChipWidth = 'fill' | 'hug'

type StateKey = 'inactive' | 'active' | 'inactiveDisabled' | 'activeDisabled'

/**
 * @param text 칩에 표시할 텍스트
 * @param active 칩이 선택된 상태인지: true | false (optional, 기본값 false)
 * @param disabled 칩이 비활성화 상태인지: true | false (optional, 기본값 false)
 * @param width 칩의 가로 크기: 'fill' | 'hug'. 'fill'은 부모 컨테이너 너비를 꽉 채우고,
 * 'hug'는 텍스트 길이만큼만 차지함 (optional, 기본값 'hug')
 * @param onPress 칩을 클릭할 때 발생하는 event 명시 (optional)
 */
export interface ChipProps {
  text: string
  active?: boolean
  disabled?: boolean
  width?: ChipWidth
  onPress?: () => void
}

const containerVariants: Record<StateKey, ViewStyle> = {
  inactive: {
    backgroundColor: colors.surface.neutral.default,
    borderWidth: stroke.default,
    borderColor: colors.border.primary.bold,
  },
  active: {
    backgroundColor: colors.surface.primary.bold,
  },
  inactiveDisabled: {
    backgroundColor: colors.surface.neutral.subtlest,
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.default,
  },
  activeDisabled: {
    backgroundColor: colors.surface.neutral.subtle,
  },
}

const textColorVariants: Record<StateKey, TextStyle> = {
  inactive: { color: colors.content.neutral.default },
  active: { color: colors.content.neutral.inverse },
  inactiveDisabled: { color: colors.content.neutral.subtlest },
  activeDisabled: { color: colors.content.neutral.subtlest },
}

const widthVariants: Record<ChipWidth, ViewStyle> = {
  fill: { width: '100%' },
  hug: {},
}

export const Chip = ({
  text,
  active = false,
  disabled = false,
  width = 'hug',
  onPress,
}: ChipProps) => {
  const stateKey: StateKey = disabled
    ? active
      ? 'activeDisabled'
      : 'inactiveDisabled'
    : active
      ? 'active'
      : 'inactive'

  return (
    <Pressable onPress={disabled ? undefined : onPress} disabled={disabled}>
      <View style={[styles.container, containerVariants[stateKey], widthVariants[width]]}>
        <Text style={[styles.text, textColorVariants[stateKey]]} numberOfLines={1}>
          {text}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    borderRadius: radius.full,
  },
  text: {
    fontFamily: getFontFamily(typography.calloutRegular.fontWeight),
    fontSize: typography.calloutRegular.fontSize,
    lineHeight: typography.calloutRegular.lineHeight,
    letterSpacing: typography.calloutRegular.letterSpacing,
    fontWeight: typography.calloutRegular.fontWeight,
  },
})
