import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { colors, spacing } from '@repo/tokens'
import { Text } from '../Text'

/**
 * @param label 스피너 아래에 표시할 안내 텍스트 (optional)
 */
export interface LoadingOverlayProps {
  label?: string
}

/**
 * 화면 전체를 반투명하게 덮고 가운데에 스피너를 보여주는 로딩 오버레이. 부모
 * 컨테이너를 꽉 채우도록 절대 위치로 배치되므로, 화면(screen) 컴포넌트의
 * 최상위 View 안에 조건부로 렌더링해서 쓴다 — 재클릭으로 인한 중복 요청을
 * 막아야 하는 생성/저장 중 상태에 사용한다.
 */
export const LoadingOverlay = ({ label }: LoadingOverlayProps) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.content.neutral.inverse} />
      {label ? (
        <Text color="inverse" variant="bodyEmphasized">
          {label}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[12],
    backgroundColor: colors.surface.neutral.alpha['inverse-alpha-30'],
  },
})
