import type { ViewStyle, TextStyle, ImageStyle } from 'react-native'
import { Image, StyleSheet, Text, View } from 'react-native'
import { colors, icon, radius, spacing, stroke, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'
import type { BadgeId } from '../../assets/badges'
import { badgeAssets } from '../../assets/badges'

/**
 * @param title 배지 이름
 * @param subtitle 이름 아래 보조 텍스트 — 획득 상태면 포인트(예: '+10pt'), 잠금
 * 상태면 힌트 문구(예: '조건 미달', '3/17개 지역')
 * @param badgeId 표시할 배지 종류: BadgeId (optional). 지정하지 않으면 아이콘 없이
 * 빈 원만 표시됨
 * @param locked 미획득 상태인지: true | false (optional, 기본값 false). true면
 * 카드/아이콘이 회색조로, 아이콘은 반투명으로 표시됨
 */
export interface BadgeCardProps {
  title: string
  subtitle: string
  badgeId?: BadgeId
  locked?: boolean
}

export const BadgeCard = ({ title, subtitle, badgeId, locked = false }: BadgeCardProps) => {
  return (
    <View style={[styles.container, locked && styles.containerLocked]}>
      <View style={[styles.iconSlot, locked && styles.iconSlotLocked]}>
        {badgeId ? (
          <Image
            source={badgeAssets[badgeId]}
            style={[styles.icon, locked && styles.iconLocked]}
          />
        ) : null}
      </View>
      <Text style={[styles.title, locked && styles.titleLocked]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[styles.subtitle, locked && styles.subtitleLocked]} numberOfLines={1}>
        {subtitle}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexBasis: '48%',
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[6],
    paddingVertical: spacing[14],
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.subtle,
    borderRadius: radius[34],
    backgroundColor: colors.surface.neutral.default,
    overflow: 'hidden',
  },
  containerLocked: {
    borderColor: colors.border.neutral.subtle,
    backgroundColor: colors.surface.neutral.subtle,
  } satisfies ViewStyle,
  iconSlot: {
    width: icon.xlarge,
    height: icon.xlarge,
    borderRadius: radius.full,
    backgroundColor: colors.surface.primary.subtlest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlotLocked: {
    backgroundColor: colors.border.neutral.bold,
  } satisfies ViewStyle,
  icon: {
    width: 36,
    height: 36,
  },
  iconLocked: {
    opacity: 0.5,
  } satisfies ImageStyle,
  title: {
    fontFamily: getFontFamily(typography.headlineEmphasized.fontWeight),
    fontSize: typography.headlineEmphasized.fontSize,
    lineHeight: typography.headlineEmphasized.lineHeight,
    letterSpacing: typography.headlineEmphasized.letterSpacing,
    fontWeight: typography.headlineEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  titleLocked: {
    color: colors.content.neutral.subtlest,
  } satisfies TextStyle,
  subtitle: {
    fontFamily: getFontFamily(typography.subheadlineEmphasized.fontWeight),
    fontSize: typography.subheadlineEmphasized.fontSize,
    lineHeight: typography.subheadlineEmphasized.lineHeight,
    letterSpacing: typography.subheadlineEmphasized.letterSpacing,
    fontWeight: typography.subheadlineEmphasized.fontWeight,
    color: colors.content.primary.bold,
  },
  subtitleLocked: {
    color: colors.content.neutral.subtle,
  } satisfies TextStyle,
})
