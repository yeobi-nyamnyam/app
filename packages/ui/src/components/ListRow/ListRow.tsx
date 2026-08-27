import type { ReactNode } from 'react'
import type { TextStyle, ViewStyle } from 'react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, icon as iconSize, radius, spacing, stroke, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'

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
 * @param onTailingPress tailing 텍스트만 별도로 클릭할 때 발생하는 event 명시 (optional,
 * 전달하면 tailing이 행 전체와 별개로 눌리는 영역이 됨, 예: "전문 보기" 링크)
 *
 * titleAlign이 'center'이고 icon이 있고 tailing이 없을 때는, icon과 같은 너비의 빈 공간을
 * 우측에 자동으로 둬서 title이 icon 폭에 밀리지 않고 행 전체 기준으로 정중앙에 오게 한다
 * (예: 로그인 화면의 "카카오로 시작하기" 버튼처럼 좌측 아이콘 + 완전히 중앙 정렬된 텍스트).
 */
export interface ListRowProps {
  title: string
  icon?: ReactNode
  tailing?: string
  backgroundColor?: ListRowBackground
  titleAlign?: ListRowTitleAlign
  titleWeight?: ListRowTitleWeight
  onPress?: () => void
  onTailingPress?: () => void
}

const containerVariants: Record<ListRowBackground, ViewStyle> = {
  white: { backgroundColor: colors.surface.neutral.default },
  alpha: { backgroundColor: ALPHA_BACKGROUND },
}

const titleWeightVariants: Record<ListRowTitleWeight, TextStyle> = {
  regular: {
    fontFamily: getFontFamily(typography.bodyRegular.fontWeight),
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    fontWeight: typography.bodyRegular.fontWeight,
  },
  semibold: {
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
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
  onTailingPress,
}: ListRowProps) => {
  const tailingText = tailing ? (
    <Text style={styles.tailing} numberOfLines={1}>
      {tailing}
    </Text>
  ) : null

  const showCenterSpacer = titleAlign === 'center' && !!icon && !tailing

  const content = (
    <View style={[styles.container, containerVariants[backgroundColor]]}>
      <View style={styles.icon}>{icon}</View>
      <Text style={[styles.title, titleWeightVariants[titleWeight], titleAlignVariants[titleAlign]]}>
        {title}
      </Text>
      {tailingText && onTailingPress ? (
        <Pressable onPress={onTailingPress}>{tailingText}</Pressable>
      ) : (
        tailingText
      )}
      {showCenterSpacer ? <View style={styles.icon} /> : null}
    </View>
  )

  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[8],
    padding: spacing[14],
    borderRadius: radius[23],
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
    color: colors.content.neutral.default,
  },
  tailing: {
    flexShrink: 0,
    fontFamily: getFontFamily(typography.calloutRegular.fontWeight),
    fontSize: typography.calloutRegular.fontSize,
    lineHeight: typography.calloutRegular.lineHeight,
    letterSpacing: typography.calloutRegular.letterSpacing,
    fontWeight: typography.calloutRegular.fontWeight,
    color: colors.content.neutral.subtle,
  },
})
