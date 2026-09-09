import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'
import { ChatLogRow } from '../ChatLogRow'

/**
 * @param id 행을 구분하는 고유 id (`meal_logs.id`)
 * @param title 매장/항목 이름
 * @param time 소비 시각 텍스트 (예: "19:20")
 * @param categoryLabel 끼니/카테고리 배지 텍스트 (예: "점심")
 * @param price 소비 금액 텍스트 (예: "13,000원")
 */
export interface ChatLogListItem {
  id: string
  title: string
  time: string
  categoryLabel: string
  price: string
}

/**
 * @param day 날짜/일차 헤더 텍스트 (예: "08.12 | 1일차")
 * @param items 해당 날짜에 확정된 소비 목록
 */
export interface ChatLogListProps {
  day: string
  items: ChatLogListItem[]
}

/**
 * 날짜 헤더 + `ChatLogRow` 목록을 묶는 그룹 (Figma "Chat Log List").
 * 채팅 로그 목록 화면에서 날짜별로 반복해서 쓰인다.
 */
export const ChatLogList = ({ day, items }: ChatLogListProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.day}>{day}</Text>
      <View style={styles.rows}>
        {items.map((item) => (
          <ChatLogRow
            key={item.id}
            title={item.title}
            time={item.time}
            categoryLabel={item.categoryLabel}
            price={item.price}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing[8],
  },
  day: {
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: typography.bodyEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  rows: {
    width: '100%',
    gap: spacing[6],
  },
})
