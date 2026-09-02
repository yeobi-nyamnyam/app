import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, stroke, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'
import { Icon } from '../Icon'

export type SettingRowVariant = 'default' | 'danger'

/**
 * @param title 설정 항목 제목
 * @param subtitle 제목 아래 보조 텍스트 (optional, 예: 현재 닉네임 값)
 * @param showChevron 우측 화살표 표시 여부: true | false (optional, 기본값 true)
 * @param variant 제목 색상: 'default' | 'danger' (optional, 기본값 'default'.
 * 'danger'는 회원탈퇴처럼 위험한 동작에 씀 — 빨간 텍스트)
 * @param onPress 행을 클릭할 때 발생하는 event 명시 (optional)
 */
export interface SettingRowProps {
  title: string
  subtitle?: string
  showChevron?: boolean
  variant?: SettingRowVariant
  onPress?: () => void
}

export const SettingRow = ({ title, subtitle, showChevron = true, variant = 'default', onPress }: SettingRowProps) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.col}>
        <Text style={[styles.title, variant === 'danger' && styles.titleDanger]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {showChevron ? (
        <View style={styles.chevron}>
          <Icon name="chevron-left" size="small" color={colors.content.neutral.subtle} />
        </View>
      ) : null}
    </Pressable>
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
    gap: spacing[2],
  },
  title: {
    fontFamily: getFontFamily(typography.subheadlineEmphasized.fontWeight),
    fontSize: typography.subheadlineEmphasized.fontSize,
    lineHeight: typography.subheadlineEmphasized.lineHeight,
    letterSpacing: typography.subheadlineEmphasized.letterSpacing,
    fontWeight: typography.subheadlineEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  titleDanger: {
    color: colors.content.error.default,
  },
  subtitle: {
    fontFamily: getFontFamily(typography.footnoteRegular.fontWeight),
    fontSize: typography.footnoteRegular.fontSize,
    lineHeight: typography.footnoteRegular.lineHeight,
    letterSpacing: typography.footnoteRegular.letterSpacing,
    fontWeight: typography.footnoteRegular.fontWeight,
    color: colors.content.neutral.subtle,
  },
  chevron: {
    transform: [{ rotate: '180deg' }],
  },
})
