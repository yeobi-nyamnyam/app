import { Pressable, View } from 'react-native'
import { Icon, TextField } from '@repo/ui'

/**
 * @param value 필드에 표시할 값 (직접 타이핑으로는 바뀌지 않음)
 * @param placeholder 값이 없을 때 표시할 안내 텍스트
 * @param onPress 필드를 눌렀을 때 발생하는 event 명시 — 여기서 바텀시트/검색 모달 등을 연다
 * @param showChevron 우측에 드롭다운 화살표 아이콘을 보여줄지: true | false (optional, 기본값 true)
 */
export interface PickerFieldProps {
  value: string
  placeholder: string
  onPress: () => void
  showChevron?: boolean
}

// 값을 직접 타이핑하지 않고, 눌렀을 때 별도 선택 UI(바텀시트/검색 모달)를 여는
// 필드에 공통으로 쓰는 표시용 TextField 래퍼.
export const PickerField = ({
  value,
  placeholder,
  onPress,
  showChevron = true,
}: PickerFieldProps) => (
  <Pressable onPress={onPress}>
    <View pointerEvents="none">
      <TextField
        value={value}
        onChangeText={() => {}}
        placeholder={placeholder}
        tailingIcon={showChevron ? <Icon name="chevron-down" size="medium" /> : undefined}
      />
    </View>
  </Pressable>
)
