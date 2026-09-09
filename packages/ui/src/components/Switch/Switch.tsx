import { Pressable, StyleSheet, View } from 'react-native'
import { colors, radius, spacing } from '@repo/tokens'

const TRACK_WIDTH = 44
const TRACK_HEIGHT = 26
const KNOB_SIZE = 22

/**
 * @param value 스위치가 켜진 상태인지: true | false
 * @param onPress 스위치를 클릭할 때 발생하는 event 명시 (optional)
 */
export interface SwitchProps {
  value: boolean
  onPress?: () => void
}

export const Switch = ({ value, onPress }: SwitchProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.track,
        {
          backgroundColor: value ? colors.surface.primary.default : colors.surface.neutral.bold,
          justifyContent: value ? 'flex-end' : 'flex-start',
        },
      ]}
    >
      <View style={styles.knob} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    flexDirection: 'row',
    borderRadius: radius.full,
    padding: spacing[2],
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.surface.neutral.default,
  },
})
