import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, typography } from '@repo/tokens'
import { Button } from '../Button'
import { getFontFamily } from '../../typography/getFontFamily'

/**
 * 다이얼로그 카드 자체만 그리는 컴포넌트. 배경 오버레이/열림·닫힘 상태는 RN 기본
 * `Modal`(react-native)로 감싸서 처리한다 — 이 컴포넌트는 그 안에 들어가는 내용물.
 * `onCancel`을 전달하지 않으면 취소 버튼 없이 확인 버튼 하나만 전체 너비로 표시된다
 * (안내성 모달처럼 선택지가 하나뿐일 때 사용).
 *
 * @param title 다이얼로그 제목
 * @param content 다이얼로그 본문 텍스트
 * @param cancelLabel 취소 버튼 텍스트 (optional, 기본값 "취소")
 * @param confirmLabel 확인 버튼 텍스트 (optional, 기본값 "확인")
 * @param onCancel 취소 버튼을 클릭할 때 발생하는 event 명시 (optional, 전달하지 않으면
 * 취소 버튼 자체가 렌더링되지 않고 확인 버튼 하나만 남는다)
 * @param onConfirm 확인 버튼을 클릭할 때 발생하는 event 명시 (optional)
 */
export interface ModalProps {
  title: string
  content: string
  cancelLabel?: string
  confirmLabel?: string
  onCancel?: () => void
  onConfirm?: () => void
}

export const Modal = ({
  title,
  content,
  cancelLabel = '취소',
  confirmLabel = '확인',
  onCancel,
  onConfirm,
}: ModalProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.content}>{content}</Text>
      </View>
      <View style={styles.btnRow}>
        {onCancel ? (
          <View style={styles.btnFlex}>
            <Button label={cancelLabel} variant="outline" onPress={onCancel} />
          </View>
        ) : null}
        <View style={styles.btnFlex}>
          <Button label={confirmLabel} variant="primary" onPress={onConfirm} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 318,
    paddingHorizontal: spacing[20],
    paddingVertical: spacing[14],
    borderRadius: radius[34],
    backgroundColor: colors.surface.neutral.default,
    shadowColor: colors.surface.neutral.inverse,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  textBlock: {
    width: '100%',
    paddingTop: spacing[8],
    paddingBottom: spacing[24],
  },
  title: {
    width: '100%',
    fontFamily: getFontFamily(typography.title3Emphasized.fontWeight),
    fontSize: typography.title3Emphasized.fontSize,
    lineHeight: typography.title3Emphasized.lineHeight,
    letterSpacing: typography.title3Emphasized.letterSpacing,
    fontWeight: typography.title3Emphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  content: {
    width: '100%',
    fontFamily: getFontFamily(typography.bodyRegular.fontWeight),
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    fontWeight: typography.bodyRegular.fontWeight,
    color: colors.content.neutral.default,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing[8],
    width: '100%',
  },
  btnFlex: {
    flex: 1,
  },
})
