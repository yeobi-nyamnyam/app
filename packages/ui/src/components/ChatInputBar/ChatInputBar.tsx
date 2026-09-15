import type { TextStyle, ViewStyle } from 'react-native'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'
import { colors, radius, spacing, stroke, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'
import { Icon } from '../Icon'

/**
 * @param value 입력 중인 텍스트
 * @param onChangeText 텍스트가 바뀔 때 발생하는 event
 * @param onSend 전송 버튼을 누르거나 키보드에서 전송 키를 눌렀을 때 발생하는 event.
 * `value`가 빈 문자열(공백 제외)이면 호출되지 않는다 (optional)
 * @param placeholder 입력값이 없을 때 표시할 안내 문구 (optional, 기본값 '얼마 썼는지 말해주세요')
 * @param disabled 입력창과 전송 버튼이 비활성화 상태인지: true | false (optional, 기본값 false)
 */
export interface ChatInputBarProps {
  value: string
  onChangeText: (text: string) => void
  onSend?: () => void
  placeholder?: string
  disabled?: boolean
}

type StateKey = 'default' | 'disabled'

const fieldVariants: Record<StateKey, TextStyle> = {
  default: {
    backgroundColor: colors.surface.primary.subtlest,
    color: colors.content.neutral.default,
  },
  disabled: {
    backgroundColor: colors.surface.neutral.disabled,
    color: colors.content.neutral.disabled,
  },
}

const sendButtonVariants: Record<StateKey, ViewStyle> = {
  default: { backgroundColor: colors.surface.primary.default },
  disabled: { backgroundColor: colors.surface.primary.disabled },
}

const sendIconColorVariants: Record<StateKey, string> = {
  default: colors.content.neutral.inverse,
  disabled: colors.content.neutral.disabled,
}

/**
 * 채팅 화면 하단의 메시지 입력창 (Figma "Input Bar", node-id=741-17525).
 * 알약형 입력 필드와 원형 전송 버튼으로 구성된다.
 */
export const ChatInputBar = ({
  value,
  onChangeText,
  onSend,
  placeholder = '얼마 썼는지 말해주세요',
  disabled = false,
}: ChatInputBarProps) => {
  const stateKey: StateKey = disabled ? 'disabled' : 'default'

  const handleSend = () => {
    if (!disabled && value.trim().length > 0) {
      onSend?.()
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.field, fieldVariants[stateKey]]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.content.neutral.subtlest}
        returnKeyType="send"
        onSubmitEditing={handleSend}
        editable={!disabled}
      />
      <Pressable
        style={[styles.sendButton, sendButtonVariants[stateKey]]}
        onPress={disabled ? undefined : handleSend}
        disabled={disabled}
      >
        <Icon name="arrow-right" size="medium" color={sendIconColorVariants[stateKey]} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[8],
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    backgroundColor: colors.surface.neutral.default,
    borderTopWidth: stroke.default,
    borderTopColor: colors.border.neutral.subtle,
  },
  field: {
    flex: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    fontFamily: getFontFamily(typography.bodyRegular.fontWeight),
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
  },
  sendButton: {
    width: 37,
    height: 37,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
