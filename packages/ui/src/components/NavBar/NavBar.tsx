import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, spacing, stroke, typography } from '@repo/tokens'
import { Icon, type IconName } from '../Icon'

export type NavBarItemKey = 'home' | 'recommend' | 'chat' | 'record' | 'profile'

const ITEMS: { key: NavBarItemKey; icon: IconName; label: string }[] = [
  { key: 'home', icon: 'home', label: '홈' },
  { key: 'recommend', icon: 'recommend', label: '추천' },
  { key: 'chat', icon: 'chat', label: '채팅' },
  { key: 'record', icon: 'record', label: '기록' },
  { key: 'profile', icon: 'profile', label: '프로필' },
]

/**
 * @param active 현재 선택된 탭: 'home' | 'recommend' | 'chat' | 'record' | 'profile'
 * @param onChange 탭을 클릭할 때 발생하는 event, 클릭된 탭의 key를 인자로 전달 (optional)
 */
export interface NavBarProps {
  active: NavBarItemKey
  onChange?: (key: NavBarItemKey) => void
}

export const NavBar = ({ active, onChange }: NavBarProps) => {
  return (
    <View style={styles.container}>
      {ITEMS.map((item) => {
        const selected = item.key === active
        const color = selected ? colors.content.neutral.default : colors.content.neutral.subtlest
        return (
          <Pressable key={item.key} style={styles.item} onPress={() => onChange?.(item.key)}>
            <Icon name={item.icon} size="medium" color={color} />
            <Text style={[styles.label, { color }]}>{item.label}</Text>
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
    backgroundColor: colors.surface.neutral.default,
    borderTopWidth: stroke.default,
    borderTopColor: colors.border.neutral.subtle,
    paddingHorizontal: spacing[200],
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[50],
    paddingTop: spacing[200],
    paddingBottom: spacing[300],
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.subheadlineEmphasized.fontSize,
    lineHeight: typography.subheadlineEmphasized.lineHeight,
    letterSpacing: typography.subheadlineEmphasized.letterSpacing,
    fontWeight: typography.subheadlineEmphasized.fontWeight,
  },
})
