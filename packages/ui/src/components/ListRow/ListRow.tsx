import type { ReactNode } from 'react'
import type { TextStyle, ViewStyle } from 'react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, icon as iconSize, radius, spacing, stroke, typography } from '@repo/tokens'

export type ListRowBackground = 'white' | 'alpha'
export type ListRowTitleAlign = 'left' | 'center'
export type ListRowTitleWeight = 'regular' | 'semibold'

// Surface/Neutral/Alpha/alpha-60 (#ffffff99) — packages/tokens에 아직 없는 색상.
// tokens.json에 추가되면 이 상수는 지우고 colors 토큰을 참조하도록 교체
const ALPHA_BACKGROUND = '#ffffff99'

/**
 * @param title 리스트 행에 표시할 제목 텍스트
 * @param icon 좌측에 표시할 24x24 아이콘 (optional)
 * @param tailing 우측에 표시할 보조 텍스트 (optional, 있을 때만 표시됨)
 * @param backgroundColor 배경 종류: 'white' | 'alpha' (optional, 기본값 'alpha')
 * @param titleAlign 제목 정렬: 'left' | 'center' (optional, 기본값 'left')
 * @param titleWeight 제목 굵기: 'regular' | 'semibold' (optional, 기본값 'regular')
 * @param onPress 행을 클릭할 때 발생하는 event 명시 (optional, 전달하면 눌렀을 때 반응하는 행이 됨)
 */
export interface ListRowProps {
  title: string
  icon?: ReactNode
  tailing?: string
  backgroundColor?: ListRowBackground
  titleAlign?: ListRowTitleAlign
  titleWeight?: ListRowTitleWeight
  onPress?: () => void
}

const containerVariants: Record<ListRowBackground, ViewStyle> = {
  white: { backgroundColor: colors.surface.neutral.default },
  alpha: { backgroundColor: ALPHA_BACKGROUND },
}

const titleWeightVariants: Record<ListRowTitleWeight, TextStyle> = {
  regular: {
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    fontWeight: typography.bodyRegular.fontWeight,
  },
  semibold: {
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: typography.bodyEmphasized.fontWeight,
  },
}

const titleAlignVariants: Record<ListRowTitleAlign, TextStyle> = {
  left: { textAlign: 'left' },
  center: { textAlign: 'center' },
}

export const ListRow = ({
  title,
  icon,
  tailing,
  backgroundColor = 'alpha',
  titleAlign = 'left',
  titleWeight = 'regular',
  onPress,
}: ListRowProps) => {
  const content = (
    <View style={[styles.container, containerVariants[backgroundColor]]}>
      <View style={styles.icon}>{icon}</View>
      <Text style={[styles.title, titleWeightVariants[titleWeight], titleAlignVariants[titleAlign]]}>
        {title}
      </Text>
      {tailing ? (
        <Text style={styles.tailing} numberOfLines={1}>
          {tailing}
        </Text>
      ) : null}
    </View>
  )

  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[200],
    padding: spacing[300],
    borderRadius: radius.full,
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.default,
    overflow: 'hidden',
  },
  icon: {
    width: iconSize.medium,
    height: iconSize.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: typography.fontFamily,
    color: colors.content.neutral.default,
  },
  tailing: {
    flexShrink: 0,
    fontFamily: typography.fontFamily,
    fontSize: typography.calloutRegular.fontSize,
    lineHeight: typography.calloutRegular.lineHeight,
    letterSpacing: typography.calloutRegular.letterSpacing,
    fontWeight: typography.calloutRegular.fontWeight,
    color: colors.content.neutral.subtle,
  },
})
