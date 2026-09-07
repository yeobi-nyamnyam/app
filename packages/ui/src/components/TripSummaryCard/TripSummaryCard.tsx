import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, stroke, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'
import { Badge, type BadgeVariant } from '../Badge'

/**
 * @param title 여행 이름
 * @param subtitle 기간 · 지역 텍스트 (예: '2026.04.11 - 04.14 · 제주')
 * @param ratioLabel 예산 대비 소비율 텍스트 (예: '87%')
 * @param tagLabel 태그에 표시할 텍스트 (예: '예산 준수')
 * @param tagVariant 태그 색상: 'success' | 'warning' (예산 준수 여부에 따라)
 */
export interface TripSummaryCardProps {
  title: string
  subtitle: string
  ratioLabel: string
  tagLabel: string
  tagVariant: Extract<BadgeVariant, 'success' | 'warning'>
}

export const TripSummaryCard = ({ title, subtitle, ratioLabel, tagLabel, tagVariant }: TripSummaryCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.col}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.ratio, tagVariant === 'warning' && styles.ratioWarning]}>{ratioLabel}</Text>
        <Badge label={tagLabel} variant={tagVariant} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[14],
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.subtle,
    borderRadius: radius[16],
    backgroundColor: colors.surface.neutral.default,
  },
  col: {
    flex: 1,
    gap: spacing[2],
  },
  title: {
    fontFamily: getFontFamily(typography.calloutEmphasized.fontWeight),
    fontSize: typography.calloutEmphasized.fontSize,
    lineHeight: typography.calloutEmphasized.lineHeight,
    letterSpacing: typography.calloutEmphasized.letterSpacing,
    fontWeight: typography.calloutEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  subtitle: {
    fontFamily: getFontFamily(typography.footnoteRegular.fontWeight),
    fontSize: typography.footnoteRegular.fontSize,
    lineHeight: typography.footnoteRegular.lineHeight,
    letterSpacing: typography.footnoteRegular.letterSpacing,
    fontWeight: typography.footnoteRegular.fontWeight,
    color: colors.content.neutral.subtle,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing[2],
  },
  ratio: {
    fontFamily: getFontFamily(typography.calloutEmphasized.fontWeight),
    fontSize: typography.calloutEmphasized.fontSize,
    lineHeight: typography.calloutEmphasized.lineHeight,
    letterSpacing: typography.calloutEmphasized.letterSpacing,
    fontWeight: typography.calloutEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  ratioWarning: {
    // Figma가 소폭 초과 상태의 퍼센트 텍스트만 warning 톤(#bf904d)으로 지정
    color: '#bf904d',
  },
})
