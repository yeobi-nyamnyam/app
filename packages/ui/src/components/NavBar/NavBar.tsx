import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, spacing, stroke, typography } from '@repo/tokens'
import { Icon, type IconName } from '../Icon'
import { getFontFamily } from '../../typography/getFontFamily'

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
 * @param bottomInset 하단에 추가로 더할 여백(px). iOS 홈 인디케이터 등 시스템 영역과
 * 겹치지 않도록, 화면에서 `useSafeAreaInsets().bottom` 값을 전달한다 (optional, 기본값 0)
 */
export interface NavBarProps {
  active: NavBarItemKey
  onChange?: (key: NavBarItemKey) => void
  bottomInset?: number
}

export const NavBar = ({ active, onChange, bottomInset = 0 }: NavBarProps) => {
  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
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
    paddingHorizontal: spacing[8],
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingTop: spacing[8],
    paddingBottom: spacing[12],
  },
  label: {
    fontFamily: getFontFamily(typography.subheadlineEmphasized.fontWeight),
    fontSize: typography.subheadlineEmphasized.fontSize,
    lineHeight: typography.subheadlineEmphasized.lineHeight,
    letterSpacing: typography.subheadlineEmphasized.letterSpacing,
    fontWeight: typography.subheadlineEmphasized.fontWeight,
  },
})
