import type { TextStyle, ViewStyle } from 'react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, spacing, stroke, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'
import { EditIcon } from './EditIcon'

export type BudgetFieldRowState = 'default' | 'edited'

/**
 * @param label 좌측에 표시할 필드 이름 (예: '고정비')
 * @param value 우측에 표시할 값 텍스트 (예: '300,000원')
 * @param state 행 상태: 'default' | 'edited' (optional, 기본값 'default'). 'edited'는
 * 값과 하단 구분선이 primary 색상으로 강조됨
 * @param showEditIcon 값 옆에 연필 아이콘을 표시할지: true | false (optional, 기본값 true)
 * @param onEditPress 연필 아이콘을 눌렀을 때 발생하는 event 명시 (optional, 전달하면
 * 아이콘이 별도로 눌리는 영역이 됨. 실제로 값을 편집 가능한 입력으로 바꾸는 동작은
 * 이 컴포넌트를 사용하는 화면에서 state/value를 갱신해 처리)
 */
export interface BudgetFieldRowProps {
  label: string
  value: string
  state?: BudgetFieldRowState
  showEditIcon?: boolean
  onEditPress?: () => void
}

const containerVariants: Record<BudgetFieldRowState, ViewStyle> = {
  default: { borderBottomColor: colors.border.neutral.default },
  edited: { borderBottomColor: colors.border.primary.default },
}

const valueColorVariants: Record<BudgetFieldRowState, TextStyle> = {
  default: { color: colors.content.neutral.default },
  edited: { color: colors.content.primary.default },
}

const iconColorVariants: Record<BudgetFieldRowState, string> = {
  default: colors.content.neutral.default,
  edited: colors.content.primary.default,
}

export const BudgetFieldRow = ({
  label,
  value,
  state = 'default',
  showEditIcon = true,
  onEditPress,
}: BudgetFieldRowProps) => {
  const editIcon = <EditIcon color={iconColorVariants[state]} />

  return (
    <View style={[styles.container, containerVariants[state]]}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.value}>
        <Text style={[styles.valueText, valueColorVariants[state]]} numberOfLines={1}>
          {value}
        </Text>
        {showEditIcon ? (
          onEditPress ? (
            <Pressable onPress={onEditPress} hitSlop={spacing[8]}>
              {editIcon}
            </Pressable>
          ) : (
            editIcon
          )
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[12],
    borderBottomWidth: stroke.default,
  },
  label: {
    fontFamily: getFontFamily(typography.headlineRegular.fontWeight),
    fontSize: typography.headlineRegular.fontSize,
    lineHeight: typography.headlineRegular.lineHeight,
    letterSpacing: typography.headlineRegular.letterSpacing,
    fontWeight: typography.headlineRegular.fontWeight,
    color: colors.content.neutral.default,
  },
  value: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[6],
  },
  valueText: {
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: typography.bodyEmphasized.fontWeight,
  },
})
