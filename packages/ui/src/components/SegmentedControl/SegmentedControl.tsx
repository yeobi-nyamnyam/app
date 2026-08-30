import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'

// Surface/Neutral/Alpha/inverse-alpha-10 (#181818 at 10%) and inverse-alpha-5 (5%) —
// packages/tokens에 아직 없는 alpha 색상. tokens.json에 추가되면 이 상수는 지우고
// colors 토큰을 참조하도록 교체
const TRACK_BACKGROUND = 'rgba(24,24,24,0.1)'
const SELECTED_BORDER = 'rgba(24,24,24,0.05)'

/**
 * @param options 표시할 두 세그먼트의 라벨 [첫번째, 두번째]
 * @param selectedIndex 현재 선택된 세그먼트의 인덱스: 0 | 1
 * @param onChange 세그먼트를 클릭할 때 발생하는 event, 클릭된 세그먼트의 인덱스를 인자로 전달 (optional)
 */
export interface SegmentedControlProps {
  options: [string, string]
  selectedIndex: 0 | 1
  onChange?: (index: 0 | 1) => void
}

export const SegmentedControl = ({ options, selectedIndex, onChange }: SegmentedControlProps) => {
  return (
    <View style={styles.track}>
      {options.map((label, index) => {
        const selected = index === selectedIndex
        return (
          <Pressable
            key={label}
            style={[styles.segment, selected && styles.segmentSelected]}
            onPress={() => onChange?.(index as 0 | 1)}
          >
            <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    padding: spacing[2],
    borderRadius: radius[7],
    backgroundColor: TRACK_BACKGROUND,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    minWidth: 80,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[4],
    borderRadius: radius[7],
  },
  segmentSelected: {
    backgroundColor: colors.surface.neutral.default,
    borderWidth: 0.5,
    borderColor: SELECTED_BORDER,
    shadowColor: colors.surface.neutral.inverse,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...Platform.select({ android: { elevation: 2 } }),
  },
  label: {
    fontFamily: getFontFamily(typography.bodyRegular.fontWeight),
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    fontWeight: typography.bodyRegular.fontWeight,
    color: colors.content.neutral.default,
    textAlign: 'center',
  },
  labelSelected: {
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
    fontWeight: typography.bodyEmphasized.fontWeight,
  },
})
