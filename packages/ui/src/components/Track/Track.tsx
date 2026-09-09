import type { ViewStyle } from 'react-native'
import { StyleSheet, View } from 'react-native'
import { colors, radius } from '@repo/tokens'

type TrackState = 'default' | 'over'

/**
 * @param progress 소진율(%): 0 이상의 숫자. 100 이상이면 초과 상태로 트랙이
 * 끝까지 채워지고 색상이 error로 바뀜
 */
export interface TrackProps {
  progress: number
}

const fillVariants: Record<TrackState, ViewStyle> = {
  default: { backgroundColor: colors.surface.primary.default },
  over: { backgroundColor: colors.surface.error.bold },
}

export const Track = ({ progress }: TrackProps) => {
  const state: TrackState = progress >= 100 ? 'over' : 'default'
  const width = `${Math.min(Math.max(progress, 0), 100)}%` as const

  return (
    <View style={styles.container}>
      <View style={[styles.fill, fillVariants[state], { width }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.surface.neutral.subtle,
    overflow: 'hidden',
  },
  fill: {
    height: 10,
    borderRadius: radius.full,
  },
})
