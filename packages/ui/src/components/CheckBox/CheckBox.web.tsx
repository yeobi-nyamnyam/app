import { Pressable, StyleSheet, View } from 'react-native'
import { colors, radius } from '@repo/tokens'

const BOX_SIZE = 24
const UNCHECKED_SIZE = 18
const CHECK_PATH_D = 'M17 9L10 16L7 13'
const FILL_PATH_D =
  'M3 7.6C3 5.05949 5.05949 3 7.6 3H16.4C18.9405 3 21 5.05949 21 7.6V16.4C21 18.9405 18.9405 21 16.4 21H7.6C5.05949 21 3 18.9405 3 16.4V7.6Z'

/**
 * @param checked 체크 여부: true | false (optional, 기본값 false)
 * @param onPress 체크박스를 클릭할 때 발생하는 event 명시 (optional)
 */
export interface CheckBoxProps {
  checked?: boolean
  onPress?: () => void
}

export const CheckBox = ({ checked = false, onPress }: CheckBoxProps) => {
  const content = checked ? (
    <svg width={BOX_SIZE} height={BOX_SIZE} viewBox={`0 0 ${BOX_SIZE} ${BOX_SIZE}`} fill="none">
      <path d={FILL_PATH_D} fill={colors.surface.primary.default} />
      <path d={CHECK_PATH_D} stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <View style={styles.uncheckedBox} />
  )

  return (
    <View style={styles.container}>
      {onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckedBox: {
    width: UNCHECKED_SIZE,
    height: UNCHECKED_SIZE,
    borderRadius: radius['4.6'],
    borderWidth: 1.5,
    borderColor: colors.surface.primary.default,
    backgroundColor: colors.surface.neutral.default,
  },
})
