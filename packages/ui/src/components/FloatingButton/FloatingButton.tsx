import type { ReactNode } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'
import { radius, stroke } from '@repo/tokens'
import { Icon } from '../Icon'

const SIZE = 36

// Surface/Neutral/Alpha/alpha-30 (#ffffff at 30%) — packages/tokens에 아직 없는
// alpha 색상. tokens.json에 추가되면 이 상수는 지우고 colors 토큰을 참조하도록 교체
const BORDER_COLOR = 'rgba(255,255,255,0.3)'

/**
 * 원형 유리질감(frosted glass) 버튼. 지도 화면 위에 떠서 뒤로가기 등으로 쓰인다.
 *
 * @param icon 가운데 표시할 아이콘 (optional, 기본값 chevron-left)
 * @param onPress 버튼을 클릭할 때 발생하는 event 명시 (optional)
 */
export interface FloatingButtonProps {
  icon?: ReactNode
  onPress?: () => void
}

export const FloatingButton = ({ icon, onPress }: FloatingButtonProps) => {
  return (
    <Pressable onPress={onPress}>
      <BlurView intensity={30} tint="light" style={styles.container}>
        {icon ?? <Icon name="chevron-left" size="medium" />}
      </BlurView>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: stroke.hairline,
    borderColor: BORDER_COLOR,
    overflow: 'hidden',
  },
})
