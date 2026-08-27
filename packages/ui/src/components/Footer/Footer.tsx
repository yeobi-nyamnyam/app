import { StyleSheet, View } from 'react-native'
import { colors, spacing, stroke } from '@repo/tokens'
import { Button } from '../Button'

/**
 * @param label 확인 버튼에 표시할 텍스트 (optional, 기본값 '확인')
 * @param disabled 확인 버튼이 비활성화 상태인지: true | false (optional, 기본값 false)
 * @param onPress 확인 버튼을 클릭할 때 발생하는 event 명시 (optional)
 * @param bottomInset 하단에 추가로 더할 여백(px). 안드로이드 제스처 내비게이션 바 등
 * 시스템 영역과 겹치지 않도록, 화면에서 `useSafeAreaInsets().bottom` 값을 전달한다
 * (optional, 기본값 0)
 */
export interface FooterProps {
  label?: string
  disabled?: boolean
  onPress?: () => void
  bottomInset?: number
}

export const Footer = ({ label = '확인', disabled = false, onPress, bottomInset = 0 }: FooterProps) => {
  return (
    <View style={[styles.container, { paddingBottom: spacing[300] + bottomInset }]}>
      <Button label={label} variant="primary" disabled={disabled} onPress={onPress} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.surface.neutral.default,
    borderTopWidth: stroke.default,
    borderTopColor: colors.border.neutral.subtle,
    paddingHorizontal: spacing[400],
    paddingTop: spacing[300],
  },
})
