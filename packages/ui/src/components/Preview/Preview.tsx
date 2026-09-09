import { Image, StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, typography } from '@repo/tokens'
import { Button } from '../Button'
import { getFontFamily } from '../../typography/getFontFamily'

/**
 * 지도 마커를 눌렀을 때 뜨는 미니 프리뷰 카드.
 *
 * @param name 식당 이름
 * @param category 카테고리 텍스트 (예: "한식")
 * @param distance 거리 텍스트 (예: "0.3km")
 * @param price 가격 텍스트 (예: "6,000원")
 * @param imageUrl 썸네일 사진 URL (optional, 없으면 썸네일 영역 자체를 표시하지 않음)
 * @param showPrice 가격을 표시할지: true | false (optional, 기본값 true)
 * @param onPressDetail "상세 보기" 버튼을 클릭할 때 발생하는 event 명시 (optional)
 */
export interface PreviewProps {
  name: string
  category: string
  distance: string
  price: string
  imageUrl?: string
  showPrice?: boolean
  onPressDetail?: () => void
}

export const Preview = ({
  name,
  category,
  distance,
  price,
  imageUrl,
  showPrice = true,
  onPressDetail,
}: PreviewProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.topFrame}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.thumbnail} resizeMode="cover" />
        ) : null}
        <View style={styles.info}>
          <View style={styles.titleBlock}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{category}</Text>
              <Text style={styles.meta}>|</Text>
              <Text style={styles.meta}>{distance}</Text>
            </View>
          </View>
          {showPrice ? <Text style={styles.price}>{price}</Text> : null}
        </View>
      </View>
      <View style={styles.bottomFrame}>
        <Button label="상세 보기" variant="primary" onPress={onPressDetail} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.surface.neutral.default,
  },
  topFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[10],
    padding: spacing[12],
    width: '100%',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: radius[16],
    backgroundColor: colors.surface.neutral.subtlest,
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[10],
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    fontFamily: getFontFamily(typography.headlineEmphasized.fontWeight),
    fontSize: typography.headlineEmphasized.fontSize,
    lineHeight: typography.headlineEmphasized.lineHeight,
    letterSpacing: typography.headlineEmphasized.letterSpacing,
    fontWeight: typography.headlineEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  meta: {
    fontFamily: getFontFamily(typography.subheadlineRegular.fontWeight),
    fontSize: typography.subheadlineRegular.fontSize,
    lineHeight: typography.subheadlineRegular.lineHeight,
    letterSpacing: typography.subheadlineRegular.letterSpacing,
    fontWeight: typography.subheadlineRegular.fontWeight,
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
  bottomFrame: {
    width: '100%',
    paddingHorizontal: spacing[12],
    paddingBottom: spacing[16],
  },
})
