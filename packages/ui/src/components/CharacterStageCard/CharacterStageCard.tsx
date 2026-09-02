import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'
import { CharacterGrowth } from '../CharacterGrowth'
import type { GrowthStage } from '../CharacterGrowth'

/**
 * @param stage 캐릭터 성장 단계: 1 | 2 | 3 | 4 | 5 (Lv1~2 / Lv3~4 / Lv5~6 / Lv7~9 / Lv10+에 대응)
 * @param levelRangeLabel 단계에 해당하는 레벨 구간 텍스트 (예: 'Lv3~4')
 * @param label 단계 이름 (예: '여행자')
 * @param active 사용자의 현재 성장 단계인지: true | false (optional, 기본값 false).
 * true면 카드/아이콘 배경이 파란 톤으로, 단계 이름이 굵고 진하게 표시됨
 */
export interface CharacterStageCardProps {
  stage: GrowthStage
  levelRangeLabel: string
  label: string
  active?: boolean
}

export const CharacterStageCard = ({ stage, levelRangeLabel, label, active = false }: CharacterStageCardProps) => {
  return (
    <View style={[styles.container, active && styles.containerActive]}>
      <View style={[styles.iconSlot, active ? styles.iconSlotActive : styles.iconSlotInactive]}>
        <CharacterGrowth stage={stage} size={28} />
      </View>
      <Text style={styles.levelRangeLabel} numberOfLines={1}>
        {levelRangeLabel}
      </Text>
      {/* 안드로이드 한글 줄바꿈은 단어(공백) 경계를 우선하지 않고 음절 아무데서나
      끊어서, "배부른 여행자"가 "배부른 여행"/"자"처럼 단어 중간에서 잘렸다 —
      공백을 강제 줄바꿈으로 바꿔 항상 단어 경계에서만 끊기게 한다. */}
      <Text style={[styles.label, active && styles.labelActive]} numberOfLines={2}>
        {label.replace(' ', '\n')}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[4],
    paddingVertical: spacing[4],
    borderRadius: radius[7],
    backgroundColor: colors.surface.neutral.default,
  },
  containerActive: {
    backgroundColor: colors.surface.primary.subtlest,
  },
  iconSlot: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlotActive: {
    backgroundColor: colors.surface.primary.subtlest,
  },
  iconSlotInactive: {
    backgroundColor: colors.surface.neutral.subtlest,
  },
  levelRangeLabel: {
    fontFamily: getFontFamily(typography.footnoteRegular.fontWeight),
    fontSize: typography.footnoteRegular.fontSize,
    lineHeight: typography.footnoteRegular.lineHeight,
    letterSpacing: typography.footnoteRegular.letterSpacing,
    fontWeight: typography.footnoteRegular.fontWeight,
    color: colors.content.neutral.subtlest,
  },
  label: {
    fontFamily: getFontFamily(typography.footnoteRegular.fontWeight),
    fontSize: typography.footnoteRegular.fontSize,
    lineHeight: typography.footnoteRegular.lineHeight,
    letterSpacing: typography.footnoteRegular.letterSpacing,
    fontWeight: typography.footnoteRegular.fontWeight,
    color: colors.content.neutral.subtlest,
    textAlign: 'center',
  },
  labelActive: {
    fontFamily: getFontFamily(typography.footnoteEmphasized.fontWeight),
    fontSize: typography.footnoteEmphasized.fontSize,
    lineHeight: typography.footnoteEmphasized.lineHeight,
    letterSpacing: typography.footnoteEmphasized.letterSpacing,
    fontWeight: typography.footnoteEmphasized.fontWeight,
    // Figma가 이 텍스트만 별도 다크 톤(--primitive/grey/dark-active, #2f353c)을
    // 지정해서, content.neutral.default(#424344)보다 한 단계 더 진하게 둔다.
    color: '#2f353c',
  },
})
