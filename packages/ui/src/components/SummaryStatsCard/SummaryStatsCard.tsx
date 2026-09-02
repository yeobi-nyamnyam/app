import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'

export type SummaryStatTone = 'default' | 'error'

export interface SummaryStat {
  value: string
  label: string
  tone?: SummaryStatTone
}

/**
 * @param stats 좌측부터 표시할 통계 3개, 각 항목은 { value, label, tone? }.
 * tone이 'error'면 value가 빨간색으로 표시됨(예산 초과 등) (optional, 기본값 'default')
 */
export interface SummaryStatsCardProps {
  stats: [SummaryStat, SummaryStat, SummaryStat]
}

export const SummaryStatsCard = ({ stats }: SummaryStatsCardProps) => {
  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.stat}>
          <Text style={[styles.value, stat.tone === 'error' && styles.valueError]}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: spacing[14],
    borderRadius: radius[16],
    backgroundColor: colors.surface.primary.subtlest,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  // Figma는 이 값 텍스트를 Pretendard ExtraBold(800)로 쓰지만, 앱에 번들된 폰트
  // 굵기는 Regular/SemiBold/Bold(700)까지만 있어 가장 굵은 Bold로 근사한다
  // (bodyEmphasized의 크기/줄간격은 그대로 쓰고 굵기만 700으로 올림).
  value: {
    fontFamily: getFontFamily('700'),
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: '700',
    color: colors.content.neutral.default,
  },
  valueError: {
    color: colors.content.error.default,
  },
  label: {
    fontFamily: getFontFamily(typography.footnoteRegular.fontWeight),
    fontSize: typography.footnoteRegular.fontSize,
    lineHeight: typography.footnoteRegular.lineHeight,
    letterSpacing: typography.footnoteRegular.letterSpacing,
    fontWeight: typography.footnoteRegular.fontWeight,
    color: colors.content.neutral.subtle,
  },
})
