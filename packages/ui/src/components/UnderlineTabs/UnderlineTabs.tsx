import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, spacing, stroke, typography } from '@repo/tokens'

/**
 * @param tabs 표시할 탭 라벨 목록
 * @param activeIndex 현재 선택된 탭의 인덱스
 * @param onChange 탭을 클릭할 때 발생하는 event, 클릭된 탭의 인덱스를 인자로 전달 (optional)
 */
export interface UnderlineTabsProps {
  tabs: string[]
  activeIndex: number
  onChange?: (index: number) => void
}

export const UnderlineTabs = ({ tabs, activeIndex, onChange }: UnderlineTabsProps) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const selected = index === activeIndex
        return (
          <Pressable
            key={tab}
            style={[styles.tab, selected && styles.tabSelected]}
            onPress={() => onChange?.(index)}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{tab}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[8],
    backgroundColor: colors.surface.neutral.default,
    borderBottomWidth: stroke.default,
    borderBottomColor: colors.border.neutral.subtle,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[8],
    borderBottomWidth: stroke.focusRing,
    borderBottomColor: 'transparent',
  },
  tabSelected: {
    borderBottomColor: colors.border.primary.default,
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: typography.bodyEmphasized.fontWeight,
    color: colors.content.neutral.subtlest,
  },
  labelSelected: {
    color: colors.content.primary.default,
  },
})
