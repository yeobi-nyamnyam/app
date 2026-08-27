import type { TextStyle } from 'react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, icon as iconSize, spacing, typography } from '@repo/tokens'
import { Icon } from '../Icon'

export type HeaderTextAlign = 'center' | 'start'
export type HeaderTailing = 'none' | 'text'

/**
 * @param title 헤더에 표시할 제목 텍스트
 * @param textAlign 제목 정렬: 'center' | 'start' (optional, 기본값 'center')
 * @param tailing 우측 영역 종류: 'none' | 'text' (optional, 기본값 'none'. 'none'이면
 * 좌측 뒤로가기 버튼과 동일한 너비의 빈 공간을 두어 제목이 가운데 정렬되도록 균형을 맞춘다)
 * @param tailingText 우측에 표시할 텍스트, tailing이 'text'일 때만 사용 (optional)
 * @param onBackPress 좌측 뒤로가기 버튼을 클릭할 때 발생하는 event 명시 (optional)
 * @param onTailingPress 우측 텍스트를 클릭할 때 발생하는 event 명시, tailing이 'text'일 때만
 * 동작 (optional, 전달하지 않으면 텍스트만 표시되고 눌러도 반응하지 않음)
 * @param topInset 상단에 추가로 더할 여백(px). 상태바/카메라 컷아웃 등 시스템 영역과
 * 겹치지 않도록, 화면에서 `useSafeAreaInsets().top` 값을 전달한다 (optional, 기본값 0)
 */
export interface HeaderProps {
  title: string
  textAlign?: HeaderTextAlign
  tailing?: HeaderTailing
  tailingText?: string
  onBackPress?: () => void
  onTailingPress?: () => void
  topInset?: number
}

const titleAlignVariants: Record<HeaderTextAlign, TextStyle> = {
  center: { textAlign: 'center' },
  start: { textAlign: 'left' },
}

export const Header = ({
  title,
  textAlign = 'center',
  tailing = 'none',
  tailingText,
  onBackPress,
  onTailingPress,
  topInset = 0,
}: HeaderProps) => {
  return (
    <View style={[styles.container, { paddingTop: spacing[100] + topInset }]}>
      <Pressable style={styles.leading} onPress={onBackPress} hitSlop={spacing[200]}>
        <Icon name="chevron-left" size="medium" />
      </Pressable>
      <Text style={[styles.title, titleAlignVariants[textAlign]]} numberOfLines={1}>
        {title}
      </Text>
      {tailing === 'text' ? (
        <Pressable style={styles.tailing} onPress={onTailingPress}>
          <Text style={styles.tailingText}>{tailingText}</Text>
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.surface.neutral.default,
    paddingBottom: spacing[100],
  },
  leading: {
    width: iconSize.xlarge,
    height: iconSize.xlarge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: iconSize.xlarge,
    height: iconSize.xlarge,
  },
  title: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: typography.title2Bold.fontSize,
    lineHeight: typography.title2Bold.lineHeight,
    letterSpacing: typography.title2Bold.letterSpacing,
    fontWeight: typography.title2Bold.fontWeight,
    color: colors.content.neutral.default,
  },
  tailing: {
    height: iconSize.xlarge,
    minWidth: iconSize.xlarge,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: spacing[400],
  },
  tailingText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    fontWeight: typography.bodyRegular.fontWeight,
    color: colors.content.neutral.default,
    textAlign: 'right',
  },
})
