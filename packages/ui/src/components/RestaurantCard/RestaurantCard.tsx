import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, stroke, typography } from '@repo/tokens'
import { Badge } from '../Badge'
import { getFontFamily } from '../../typography/getFontFamily'

/**
 * @param name 식당 이름
 * @param price 표시할 가격 텍스트 (예: "6,000원")
 * @param address 주소
 * @param category 카테고리 텍스트 (예: "한식")
 * @param budgetLabel 예산 대비 배지에 표시할 텍스트 (예: "예산 0%")
 * @param onPress 카드를 클릭할 때 발생하는 event 명시 (optional)
 */
export interface RestaurantCardProps {
  name: string
  price: string
  address: string
  category: string
  budgetLabel: string
  onPress?: () => void
}

export const RestaurantCard = ({
  name,
  price,
  address,
  category,
  budgetLabel,
  onPress,
}: RestaurantCardProps) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.body}>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.price}>{price}</Text>
          </View>
          <Text style={styles.address} numberOfLines={1}>
            {address}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.category} numberOfLines={1}>
            {category}
          </Text>
          <Badge label={budgetLabel} variant="sky" />
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: radius[16],
    borderWidth: stroke.hairline,
    borderColor: colors.border.neutral.subtle,
    backgroundColor: colors.surface.neutral.default,
  },
  body: {
    gap: spacing[4],
    paddingTop: spacing[8],
    paddingBottom: spacing[12],
    paddingHorizontal: spacing[16],
  },
  info: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[16],
    width: '100%',
  },
  name: {
    flex: 1,
    fontFamily: getFontFamily(typography.headlineEmphasized.fontWeight),
    fontSize: typography.headlineEmphasized.fontSize,
    lineHeight: typography.headlineEmphasized.lineHeight,
    letterSpacing: typography.headlineEmphasized.letterSpacing,
    fontWeight: typography.headlineEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  price: {
    fontFamily: getFontFamily(typography.title3Emphasized.fontWeight),
    fontSize: typography.title3Emphasized.fontSize,
    lineHeight: typography.title3Emphasized.lineHeight,
    letterSpacing: typography.title3Emphasized.letterSpacing,
    fontWeight: typography.title3Emphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  address: {
    fontFamily: getFontFamily(typography.subheadlineRegular.fontWeight),
    fontSize: typography.subheadlineRegular.fontSize,
    lineHeight: typography.subheadlineRegular.lineHeight,
    letterSpacing: typography.subheadlineRegular.letterSpacing,
    fontWeight: typography.subheadlineRegular.fontWeight,
    color: colors.content.neutral.default,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[6],
    width: '100%',
  },
  category: {
    flex: 1,
    fontFamily: getFontFamily(typography.subheadlineRegular.fontWeight),
    fontSize: typography.subheadlineRegular.fontSize,
    lineHeight: typography.subheadlineRegular.lineHeight,
    letterSpacing: typography.subheadlineRegular.letterSpacing,
    fontWeight: typography.subheadlineRegular.fontWeight,
    color: colors.content.neutral.default,
  },
})
