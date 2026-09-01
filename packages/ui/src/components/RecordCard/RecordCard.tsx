import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, stroke, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'

/**
 * @param title 카드 제목 (여행 이름 또는 소비 기록 제목)
 * @param period 부제목으로 표시할 기간/시각 텍스트 (예: "2026.08.12 - 2026.08.14", "20:00")
 * @param budget 우측에 표시할 금액 텍스트 (optional, 예: "18,000원")
 * @param showBudget budget을 표시할지: true | false (optional, 기본값 true — budget이 없는
 * 일기 등의 기록에는 false로 감춘다)
 * @param onPress 카드를 클릭할 때 발생하는 event 명시 (optional)
 */
export interface RecordCardProps {
  title: string
  period: string
  budget?: string
  showBudget?: boolean
  onPress?: () => void
}

export const RecordCard = ({ title, period, budget, showBudget = true, onPress }: RecordCardProps) => {
  const content = (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.period}>{period}</Text>
      </View>
      {showBudget && budget ? (
        <Text style={styles.budget} numberOfLines={1}>
          {budget}
        </Text>
      ) : null}
    </View>
  )

  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[10],
    padding: spacing[14],
    borderRadius: radius[23],
    borderWidth: stroke.hairline,
    borderColor: colors.border.neutral.default,
    backgroundColor: colors.surface.neutral.default,
  },
  textBlock: {
    flex: 1,
    gap: spacing[2],
  },
  title: {
    fontFamily: getFontFamily(typography.headlineEmphasized.fontWeight),
    fontSize: typography.headlineEmphasized.fontSize,
    lineHeight: typography.headlineEmphasized.lineHeight,
    letterSpacing: typography.headlineEmphasized.letterSpacing,
    fontWeight: typography.headlineEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  period: {
    fontFamily: getFontFamily(typography.subheadlineRegular.fontWeight),
    fontSize: typography.subheadlineRegular.fontSize,
    lineHeight: typography.subheadlineRegular.lineHeight,
    letterSpacing: typography.subheadlineRegular.letterSpacing,
    fontWeight: typography.subheadlineRegular.fontWeight,
    color: colors.content.neutral.default,
  },
  budget: {
    flexShrink: 0,
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: typography.bodyEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
})
