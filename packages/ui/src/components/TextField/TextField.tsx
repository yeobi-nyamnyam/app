import type { ReactNode } from 'react'
import { useState } from 'react'
import type { KeyboardTypeOptions, TextStyle, ViewStyle } from 'react-native'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { colors, icon as iconSize, radius, spacing, stroke, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'

type FieldStateKey = 'default' | 'focused' | 'filled' | 'error' | 'disabled'

/**
 * @param value 입력창에 표시할 값
 * @param onChangeText 입력값이 바뀔 때 발생하는 event 명시
 * @param placeholder 값이 없을 때 표시할 안내 텍스트 (optional)
 * @param disabled 입력창이 비활성화 상태인지: true | false (optional, 기본값 false)
 * @param error 에러 메시지. 값이 있으면 입력창이 에러 상태(빨간 테두리)로 표시되고
 * 입력창 아래에 이 메시지가 표시됨 (optional)
 * @param hideErrorMessage true면 에러 상태(빨간 테두리)는 유지하되 입력창 아래
 * 에러 메시지 텍스트는 표시하지 않음 — 호출부에서 에러 메시지를 다른 요소와 한 줄로
 * 배치하는 등 직접 레이아웃하고 싶을 때 사용 (optional, 기본값 false)
 * @param leadingIcon 입력창 좌측에 표시할 24x24 아이콘 (optional)
 * @param tailingIcon 입력창 우측에 표시할 24x24 아이콘 (optional)
 * @param keyboardType 표시할 키보드 종류, RN TextInput의 keyboardType 그대로 (optional, 기본값 'default')
 */
export interface TextFieldProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  hideErrorMessage?: boolean
  leadingIcon?: ReactNode
  tailingIcon?: ReactNode
  keyboardType?: KeyboardTypeOptions
}

const containerVariants: Record<FieldStateKey, ViewStyle> = {
  default: {
    backgroundColor: colors.surface.neutral.default,
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.default,
  },
  focused: {
    backgroundColor: colors.surface.neutral.default,
    borderWidth: stroke.focusRing,
    borderColor: colors.border.primary.default,
  },
  filled: {
    backgroundColor: colors.surface.neutral.default,
    borderWidth: stroke.default,
    borderColor: colors.border.primary.default,
  },
  error: {
    backgroundColor: colors.surface.neutral.default,
    borderWidth: stroke.default,
    borderColor: colors.border.error.default,
  },
  disabled: {
    backgroundColor: colors.surface.neutral.subtlest,
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.default,
  },
}

const inputColorVariants: Record<FieldStateKey, TextStyle> = {
  default: { color: colors.content.neutral.default },
  focused: { color: colors.content.neutral.default },
  filled: { color: colors.content.neutral.default },
  error: { color: colors.border.error.default },
  disabled: { color: colors.content.neutral.subtlest },
}

export const TextField = ({
  value,
  onChangeText,
  placeholder,
  disabled = false,
  error,
  hideErrorMessage = false,
  leadingIcon,
  tailingIcon,
  keyboardType = 'default',
}: TextFieldProps) => {
  const [isFocused, setIsFocused] = useState(false)

  const stateKey: FieldStateKey = disabled
    ? 'disabled'
    : error
      ? 'error'
      : isFocused
        ? 'focused'
        : value.length > 0
          ? 'filled'
          : 'default'

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, containerVariants[stateKey]]}>
        {leadingIcon ? <View style={styles.icon}>{leadingIcon}</View> : null}
        <TextInput
          style={[styles.input, inputColorVariants[stateKey], webFocusReset]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.content.neutral.subtlest}
          keyboardType={keyboardType}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {tailingIcon ? <View style={styles.icon}>{tailingIcon}</View> : null}
      </View>
      {error && !hideErrorMessage ? <Text style={styles.helpText}>{error}</Text> : null}
    </View>
  )
}

// react-native-web은 TextInput을 실제 <input>으로 렌더링해서, 우리 컨테이너 테두리와
// 별개로 브라우저 기본 포커스 아웃라인이 덧씌워진다 (Storybook/웹 미리보기에서만 보이고
// 네이티브 앱에는 영향 없음). outlineStyle은 RN의 TextStyle 타입에는 없는 web 전용
// 속성이라 별도 변수로 캐스팅해 합성한다.
const webFocusReset = { outlineStyle: 'none' } as unknown as TextStyle

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[8],
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    borderRadius: radius[10],
  },
  icon: {
    width: iconSize.medium,
    height: iconSize.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    padding: 0,
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: typography.bodyEmphasized.fontWeight,
  },
  helpText: {
    marginTop: spacing[4],
    paddingHorizontal: spacing[8],
    fontFamily: getFontFamily(typography.footnoteRegular.fontWeight),
    fontSize: typography.footnoteRegular.fontSize,
    lineHeight: typography.footnoteRegular.lineHeight,
    letterSpacing: typography.footnoteRegular.letterSpacing,
    fontWeight: typography.footnoteRegular.fontWeight,
    color: colors.content.error.default,
  },
})
