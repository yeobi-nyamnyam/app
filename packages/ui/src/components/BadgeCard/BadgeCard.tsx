import { Image, StyleSheet, Text, View } from 'react-native'
import { colors, icon, radius, spacing, stroke, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'
import type { BadgeId } from '../../assets/badges'
import { badgeAssets } from '../../assets/badges'

/**
 * @param title 배지 이름
 * @param point 획득 포인트 텍스트 (예: '+10pt')
 * @param badgeId 표시할 배지 종류: BadgeId (optional). 지정하지 않으면 미획득 상태로
 * 빈 원만 표시됨
 */
export interface BadgeCardProps {
  title: string
  point: string
  badgeId?: BadgeId
}

export const BadgeCard = ({ title, point, badgeId }: BadgeCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconSlot}>
        {badgeId ? <Image source={badgeAssets[badgeId]} style={styles.icon} /> : null}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.point} numberOfLines={1}>
        {point}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 120,
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
  iconSlot: {
    width: icon.xlarge,
    height: icon.xlarge,
    borderRadius: radius.full,
    backgroundColor: colors.surface.primary.subtlest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 36,
    height: 36,
  },
  title: {
    fontFamily: getFontFamily(typography.headlineEmphasized.fontWeight),
    fontSize: typography.headlineEmphasized.fontSize,
    lineHeight: typography.headlineEmphasized.lineHeight,
    letterSpacing: typography.headlineEmphasized.letterSpacing,
    fontWeight: typography.headlineEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  point: {
    fontFamily: getFontFamily(typography.subheadlineEmphasized.fontWeight),
    fontSize: typography.subheadlineEmphasized.fontSize,
    lineHeight: typography.subheadlineEmphasized.lineHeight,
    letterSpacing: typography.subheadlineEmphasized.letterSpacing,
    fontWeight: typography.subheadlineEmphasized.fontWeight,
    color: colors.content.primary.bold,
  },
})
