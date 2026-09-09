import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, stroke, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'
import { Badge } from '../Badge'

/**
 * @param title 매장/항목 이름
 * @param time 소비 시각 텍스트 (예: "19:20")
 * @param categoryLabel 끼니/카테고리 배지 텍스트 (예: "점심")
 * @param price 소비 금액 텍스트 (예: "13,000원")
 */
export interface ChatLogRowProps {
  title: string
  time: string
  categoryLabel: string
  price: string
}

/**
 * 채팅에서 확정된 소비 1건을 보여주는 행 (Figma "Chat Log Row").
 * 채팅 로그 목록(`ChatLogList`)의 최소 단위로 쓰인다.
 */
export const ChatLogRow = ({ title, time, categoryLabel, price }: ChatLogRowProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.quoteRow}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      <View style={styles.resultRow}>
        <Badge label={categoryLabel} variant="sky" />
        <Text style={styles.price}>{price}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.surface.neutral.default,
    borderWidth: stroke.hairline,
    borderColor: colors.border.neutral.default,
    borderRadius: radius[23],
    padding: spacing[14],
    gap: spacing[4],
  },
  quoteRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: getFontFamily(typography.headlineEmphasized.fontWeight),
    fontSize: typography.headlineEmphasized.fontSize,
    lineHeight: typography.headlineEmphasized.lineHeight,
    letterSpacing: typography.headlineEmphasized.letterSpacing,
    fontWeight: typography.headlineEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  time: {
    fontFamily: getFontFamily(typography.subheadlineRegular.fontWeight),
    fontSize: typography.subheadlineRegular.fontSize,
    lineHeight: typography.subheadlineRegular.lineHeight,
    letterSpacing: typography.subheadlineRegular.letterSpacing,
    fontWeight: typography.subheadlineRegular.fontWeight,
    color: colors.content.neutral.default,
  },
  resultRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: typography.bodyEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
})
