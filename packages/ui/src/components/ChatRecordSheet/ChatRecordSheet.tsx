import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'
import { Icon } from '../Icon'
import { Chip } from '../Chip'
import { TextField } from '../TextField'
import { Button } from '../Button'
import type { ChipListOption } from '../ChipList'

/**
 * @param title 시트 상단 제목 (예: "끼니 기록")
 * @param onTitlePress 제목 옆 전환 아이콘을 클릭할 때 발생하는 event 명시 (optional)
 * @param categoryLabel 항목(카테고리) 섹션 라벨 (optional, 기본값 '항목')
 * @param categories 카테고리 선택지 목록, 각 항목은 { label, value }
 * @param selectedCategory 현재 선택된 카테고리의 value
 * @param onSelectCategory 카테고리를 선택할 때 발생하는 event 명시, 선택한 value를 전달
 * @param amountLabel 금액 섹션 라벨 (optional, 기본값 '금액')
 * @param amount 금액 입력값 (숫자 문자열)
 * @param onChangeAmount 금액 입력값이 바뀔 때 발생하는 event 명시
 * @param buttonLabel 하단 제출 버튼 텍스트 (optional, 기본값 '기록 완료')
 * @param onSubmit 제출 버튼을 클릭할 때 발생하는 event 명시 (optional)
 */
export interface ChatRecordSheetProps {
  title: string
  onTitlePress?: () => void
  categoryLabel?: string
  categories: ChipListOption[]
  selectedCategory: string
  onSelectCategory: (value: string) => void
  amountLabel?: string
  amount: string
  onChangeAmount: (value: string) => void
  buttonLabel?: string
  onSubmit?: () => void
}

/**
 * 채팅에서 확정된 소비를 기록/수정하는 바텀시트 (Figma "Bottm Sheet", node-id=741-18060).
 */
export const ChatRecordSheet = ({
  title,
  onTitlePress,
  categoryLabel = '항목',
  categories,
  selectedCategory,
  onSelectCategory,
  amountLabel = '금액',
  amount,
  onChangeAmount,
  buttonLabel = '기록 완료',
  onSubmit,
}: ChatRecordSheetProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.grabberRow}>
        <View style={styles.grabber} />
      </View>
      <Pressable style={styles.titleRow} onPress={onTitlePress} hitSlop={spacing[8]}>
        <Text style={styles.titleText}>{title}</Text>
        <Icon name="swap" size="xsmall" />
      </Pressable>
      <Text style={styles.sectionLabel}>{categoryLabel}</Text>
      <View style={styles.categoryRow}>
        {categories.map((category) => (
          <Chip
            key={category.value}
            text={category.label}
            width="fill"
            active={category.value === selectedCategory}
            onPress={() => onSelectCategory(category.value)}
          />
        ))}
      </View>
      <Text style={styles.sectionLabel}>{amountLabel}</Text>
      <View style={styles.amountField}>
        <TextField
          value={amount}
          onChangeText={onChangeAmount}
          keyboardType="number-pad"
          tailingIcon={<Icon name="krw" size="medium" />}
        />
      </View>
      <View style={styles.footer}>
        <Button label={buttonLabel} onPress={onSubmit} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.surface.neutral.default,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    alignItems: 'center',
    overflow: 'hidden',
  },
  grabberRow: {
    width: '100%',
    height: 16,
    alignItems: 'center',
    paddingTop: spacing[5],
  },
  grabber: {
    width: 58,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border.neutral.bold,
  },
  titleRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing[4],
    paddingHorizontal: spacing[16],
    paddingTop: spacing[12],
  },
  titleText: {
    fontFamily: getFontFamily(typography.calloutEmphasized.fontWeight),
    fontSize: typography.calloutEmphasized.fontSize,
    lineHeight: typography.calloutEmphasized.lineHeight,
    letterSpacing: typography.calloutEmphasized.letterSpacing,
    fontWeight: typography.calloutEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  sectionLabel: {
    width: '100%',
    paddingHorizontal: spacing[16],
    paddingTop: spacing[12],
    fontFamily: getFontFamily(typography.title3Emphasized.fontWeight),
    fontSize: typography.title3Emphasized.fontSize,
    lineHeight: typography.title3Emphasized.lineHeight,
    letterSpacing: typography.title3Emphasized.letterSpacing,
    fontWeight: typography.title3Emphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  categoryRow: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing[6],
    paddingHorizontal: spacing[16],
    paddingTop: spacing[4],
  },
  amountField: {
    width: '100%',
    paddingHorizontal: spacing[16],
    paddingTop: spacing[4],
  },
  footer: {
    width: '100%',
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
  },
})
