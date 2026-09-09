import type { ViewStyle } from 'react-native'
import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, stroke, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'

export type DataCardRowVariant = 'info' | 'menu'

/**
 * @param variant 행 종류: 'info' | 'menu' (optional, 기본값 'info'). 'info'는
 * 라벨-값 쌍을 표시하고, 'menu'는 메뉴명-가격 쌍을 표시하며 하단에 구분선이 붙음
 * @param label variant가 'info'일 때 좌측에 표시할 라벨 텍스트
 * @param value variant가 'info'일 때 우측에 표시할 값 텍스트
 * @param cuisine variant가 'menu'일 때 좌측에 표시할 메뉴명
 * @param price variant가 'menu'일 때 우측에 표시할 가격 텍스트
 * @param showPrice variant가 'menu'일 때 price를 표시할지: true | false (optional, 기본값 true)
 */
export interface DataCardRowProps {
  variant?: DataCardRowVariant
  label?: string
  value?: string
  cuisine?: string
  price?: string
  showPrice?: boolean
}

const containerVariants: Record<DataCardRowVariant, ViewStyle> = {
  // value가 길어져 여러 줄로 감싸일 수 있어(영업시간/휴일/주소 등)
  // label을 첫 줄에 맞춰 위쪽 정렬한다.
  info: { alignItems: 'flex-start' },
  menu: {
    borderBottomWidth: stroke.default,
    borderBottomColor: colors.border.neutral.default,
  },
}

export const DataCardRow = ({
  variant = 'info',
  label,
  value,
  cuisine,
  price,
  showPrice = true,
}: DataCardRowProps) => {
  const isMenu = variant === 'menu'

  return (
    <View style={[styles.container, containerVariants[variant]]}>
      {isMenu ? (
        <>
          <Text style={styles.cuisine} numberOfLines={1}>
            {cuisine}
          </Text>
          {showPrice ? (
            <Text style={styles.price} numberOfLines={1}>
              {price}
            </Text>
          ) : null}
        </>
      ) : (
        <>
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
          <Text style={styles.value}>{value}</Text>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    paddingVertical: spacing[8],
  },
  label: {
    flexShrink: 0,
    fontFamily: getFontFamily(typography.subheadlineEmphasized.fontWeight),
    fontSize: typography.subheadlineEmphasized.fontSize,
    lineHeight: typography.subheadlineEmphasized.lineHeight,
    letterSpacing: typography.subheadlineEmphasized.letterSpacing,
    fontWeight: typography.subheadlineEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  value: {
    flex: 1,
    textAlign: 'right',
    fontFamily: getFontFamily(typography.bodyRegular.fontWeight),
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    fontWeight: typography.bodyRegular.fontWeight,
    color: colors.content.neutral.subtle,
  },
  cuisine: {
    flexShrink: 0,
    fontFamily: getFontFamily(typography.bodyRegular.fontWeight),
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    fontWeight: typography.bodyRegular.fontWeight,
    color: colors.content.neutral.subtle,
  },
  price: {
    flex: 1,
    textAlign: 'right',
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: typography.bodyEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
})
