import { StyleSheet, View } from 'react-native'
import { colors, spacing, stroke } from '@repo/tokens'
import { Button } from '../Button'

/**
 * @param label 확인 버튼에 표시할 텍스트 (optional, 기본값 '확인')
 * @param disabled 확인 버튼이 비활성화 상태인지: true | false — true면 눌러도 onPress가
 * 호출되지 않음 (optional, 기본값 false)
 * @param visuallyDisabled 확인 버튼이 비활성화된 것처럼 보이기만 하고 onPress는 그대로
 * 동작하는지: true | false — 눌렀을 때 안내 모달 등을 띄워야 하는 경우에 사용 (optional,
 * 기본값 false)
 * @param onPress 확인 버튼을 클릭할 때 발생하는 event 명시 (optional)
 * @param bottomInset 하단에 추가로 더할 여백(px). 안드로이드 제스처 내비게이션 바 등
 * 시스템 영역과 겹치지 않도록, 화면에서 `useSafeAreaInsets().bottom` 값을 전달한다
 * (optional, 기본값 0)
 */
export interface FooterProps {
  label?: string
  disabled?: boolean
  visuallyDisabled?: boolean
  onPress?: () => void
  bottomInset?: number
}

export const Footer = ({
  label = '확인',
  disabled = false,
  visuallyDisabled = false,
  onPress,
  bottomInset = 0,
}: FooterProps) => {
  return (
    <View style={[styles.container, { paddingBottom: spacing[12] + bottomInset }]}>
      <Button
        label={label}
        variant="primary"
        disabled={disabled}
        visuallyDisabled={visuallyDisabled}
        onPress={onPress}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.surface.neutral.default,
    borderTopWidth: stroke.default,
    borderTopColor: colors.border.neutral.subtle,
    paddingHorizontal: spacing[16],
    paddingTop: spacing[12],
  },
})
