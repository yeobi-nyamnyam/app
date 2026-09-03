import { StyleSheet, View } from 'react-native'
import { spacing } from '@repo/tokens'
import { Button } from '../Button'
import { Text } from '../Text'
import { EmptyTripIllustration } from '../EmptyTripIllustration'

/**
 * 진행 중인 여행이 없을 때 보여주는 공용 빈 상태 화면 (Figma "spent-write (empty)", 743:20870).
 * 기록뿐 아니라 여행이 필요한 모든 기능(추천/채팅 등)의 빈 상태에서 재사용한다.
 * @param onCreateTrip "첫 여행 만들기" 버튼을 눌렀을 때 발생하는 event 명시
 */
export interface EmptyTripPromptProps {
  onCreateTrip?: () => void
}

export const EmptyTripPrompt = ({ onCreateTrip }: EmptyTripPromptProps) => {
  return (
    <View style={styles.container}>
      <EmptyTripIllustration />
      <View style={styles.textBlock}>
        <Text variant="title3Emphasized">아직 진행 중인 여행이 없어요</Text>
        <Text>예산과 기간만 넣으면 식비를 자동으로 나눠드려요</Text>
      </View>
      <View style={styles.actions}>
        <Button label="첫 여행 만들기" onPress={onCreateTrip} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  textBlock: {
    alignItems: 'center',
    gap: spacing[2],
    paddingTop: spacing[16],
    paddingHorizontal: spacing[16],
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: spacing[16],
    paddingTop: spacing[26],
    paddingHorizontal: spacing[16],
  },
})
