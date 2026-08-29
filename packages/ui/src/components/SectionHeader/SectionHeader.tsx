import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'

/**
 * @param title 섹션 제목 텍스트 (예: "채팅")
 */
export interface SectionHeaderProps {
  title: string
}

/**
 * 굵은 제목만 있는 섹션 타이틀 바 (Figma "Section Header", node-id=733-16959).
 * 뒤로가기 버튼이 있는 `Header`와 달리, 화면 안 목록 섹션 제목으로 쓰인다.
 */
export const SectionHeader = ({ title }: SectionHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing[16],
    paddingTop: spacing[12],
    paddingBottom: spacing[6],
    backgroundColor: colors.surface.neutral.default,
  },
  title: {
    fontFamily: getFontFamily(typography.title2Bold.fontWeight),
    fontSize: typography.title2Bold.fontSize,
    lineHeight: typography.title2Bold.lineHeight,
    letterSpacing: typography.title2Bold.letterSpacing,
    fontWeight: typography.title2Bold.fontWeight,
    color: colors.content.neutral.default,
  },
})
