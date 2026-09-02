import { useMemo, useState } from 'react'
import {
  Modal as RNModal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { router } from 'expo-router'
import {
  Button,
  Chip,
  FormField,
  Icon,
  Modal,
  Switch,
  TextField,
  colors,
  getFontFamily,
  spacing,
  typography,
} from '@repo/ui'

import { MEAL_TYPES, MEAL_TYPE_LABEL, type MealType } from '@/lib/budget'
import { formatDigitsForDisplay, parseDigits, todayDate } from '@/lib/format'
import { pickReceiptImage } from '@/lib/receipts'
import { setReceiptOcrResolver, type ReceiptOcrFillResult } from '@/lib/receiptOcrBridge'

import { ReceiptUploadBox } from '../ReceiptUploadBox'
import { StoreSearchModal, type StoreSearchResult } from '../StoreSearchModal'
import { DropdownField, type DropdownOption } from '../DropdownField'

export type MealLogCategory = '식비' | '교통' | '숙박' | '기념품' | '기타'

const CATEGORY_OPTIONS: MealLogCategory[] = ['식비', '교통', '숙박', '기념품', '기타']

const MEAL_TYPE_OPTIONS: DropdownOption[] = MEAL_TYPES.map((mealType) => ({
  value: mealType,
  label: MEAL_TYPE_LABEL[mealType],
}))

// 아직 오지 않은 날짜는 방문 기록 대상이 아니므로 드롭다운에 노출하지 않는다.
// 일차 번호는 여행 전체 기간 기준으로 매겨야 해서 필터링 전에 index를 먼저 계산한다.
function buildTripDayOptions(dates: string[]): DropdownOption[] {
  const today = todayDate()
  return dates
    .map((date, index) => {
      const [, month, day] = date.split('-')
      return {
        value: date,
        label: `${index + 1}일차 | ${month}.${day}`,
      }
    })
    .filter((option) => option.value <= today)
}

export interface RecordFormMealSlot {
  id: string
  date: string
  mealType: MealType
  isRecorded: boolean
}

export interface RecordFormValues {
  category: MealLogCategory | ''
  amount: string
  storeName: string
  storeAddress: string
  storeLatitude: number | null
  storeLongitude: number | null
  memo: string
  mealSlotId: string | null
  visitDate: string
  receiptImageUrl: string | null
  ocrRaw: unknown
}

/**
 * @param initialValues 진입 경로(F6-1)에 따라 미리 채워진 값 (optional). category가
 * '식비'가 아닌 값으로 주어지면 끼니 소비 토글이 꺼진 채로 시작한다. mealType은
 * RecordFormValues에는 없는 입력 전용 필드로, 초기 "끼니 때" 드롭다운 선택값에만
 * 쓰인다(제출 값은 visitDate+mealType으로 찾은 mealSlotId)
 * @param submitting 저장 요청 진행 중 여부 (optional, 기본값 false)
 * @param tripDates 여행 기간 내 날짜 목록(YYYY-MM-DD 오름차순), 방문 날짜 드롭다운 옵션으로 사용
 * @param mealSlots 여행의 전체 끼니 슬롯(id/날짜/끼니때/기록 여부) — 끼니 때 드롭다운에서
 * 선택한 날짜에 이미 기록된 끼니를 제외하고, 선택된 날짜+끼니때에 해당하는 슬롯 id를
 * 찾아 onSubmit의 mealSlotId로 전달하는 데 사용
 * @param onSubmit 저장 버튼을 눌렀을 때 폼 값을 전달하는 콜백
 * @param tripId 영수증 이미지 Storage 업로드 경로({trip_id}/{uuid}.jpg)에 쓸 여행 id
 */
export interface RecordFormProps {
  initialValues?: Partial<RecordFormValues> & { mealType?: MealType }
  submitting?: boolean
  tripDates: string[]
  mealSlots: RecordFormMealSlot[]
  onSubmit: (values: RecordFormValues) => void
  tripId: string
}

// 값을 직접 타이핑하지 않고, 눌렀을 때 별도 선택 UI(바텀시트/검색 모달)를 여는
// 필드에 공통으로 쓰는 표시용 TextField 래퍼.
const PickerField = ({
  value,
  placeholder,
  onPress,
  showChevron = true,
}: {
  value: string
  placeholder: string
  onPress: () => void
  showChevron?: boolean
}) => (
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

export const RecordForm = ({
  initialValues,
  submitting = false,
  tripDates,
  mealSlots,
  onSubmit,
  tripId,
}: RecordFormProps) => {
  const initialCategory = initialValues?.category
  // 오늘 아침/점심/저녁이 전부 기록(캐스케이드 확정 포함)됐으면 더 이상 끼니
  // 소비로 기록할 대상이 없다 — 새 기록은 기타소비로 시작하고, 끼니 쪽으로
  // 돌리려 하면 안내만 하고 막는다.
  const isTodayMealComplete = MEAL_TYPES.every((mealType) =>
    mealSlots.some(
      (slot) => slot.date === todayDate() && slot.mealType === mealType && slot.isRecorded,
    ),
  )
  const [isMeal, setIsMeal] = useState(
    (!initialCategory || initialCategory === '식비') && !isTodayMealComplete,
  )
  const [category, setCategory] = useState<MealLogCategory | ''>(
    initialCategory ?? (isMeal ? '식비' : ''),
  )
  const [amount, setAmount] = useState(initialValues?.amount ?? '')
  const [storeName, setStoreName] = useState(initialValues?.storeName ?? '')
  // 주소는 매장 검색 결과 선택으로만 채워진다 (F6-10) — 사용자가 직접 타이핑하지
  // 않으므로 항상 disabled 상태의 TextField로만 보여준다. 검색 결과가 지오코딩된
  // 좌표를 같이 주므로 위경도도 함께 들고 있다가 제출 값에 실어 보낸다.
  const [storeAddress, setStoreAddress] = useState(initialValues?.storeAddress ?? '')
  const [storeLatitude, setStoreLatitude] = useState<number | null>(
    initialValues?.storeLatitude ?? null,
  )
  const [storeLongitude, setStoreLongitude] = useState<number | null>(
    initialValues?.storeLongitude ?? null,
  )
  const [memo, setMemo] = useState(initialValues?.memo ?? '')
  const [visitDate, setVisitDate] = useState(initialValues?.visitDate ?? '')
  const [mealType, setMealType] = useState(initialValues?.mealType ?? '')
  const [isStoreSearchVisible, setIsStoreSearchVisible] = useState(false)
  const [isTodayMealCompleteNoticeVisible, setIsTodayMealCompleteNoticeVisible] = useState(false)
  const [isReceiptSourceVisible, setIsReceiptSourceVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null)
  const [ocrRaw, setOcrRaw] = useState<unknown>(null)

  const tripDayOptions = useMemo(() => buildTripDayOptions(tripDates), [tripDates])
  const availableMealTypeOptions = useMemo(() => {
    const recordedMealTypes = new Set(
      mealSlots
        .filter((slot) => slot.date === visitDate && slot.isRecorded)
        .map((slot) => slot.mealType),
    )
    return MEAL_TYPE_OPTIONS.filter((option) => !recordedMealTypes.has(option.value as MealType))
  }, [mealSlots, visitDate])

  const handleVisitDateChange = (nextDate: string) => {
    setVisitDate(nextDate)
    setMealType('')
  }

  const handleToggleMeal = () => {
    if (!isMeal && isTodayMealComplete) {
      setIsTodayMealCompleteNoticeVisible(true)
      return
    }
    setIsMeal((prev) => {
      const next = !prev
      setCategory(next ? '식비' : '')
      return next
    })
  }

  const handleAmountChange = (text: string) => {
    const digits = parseDigits(text)
    setAmount(digits > 0 ? String(digits) : '')
  }

  const handleReceiptUpload = () => setIsReceiptSourceVisible(true)

  const handleReceiptFilled = (result: ReceiptOcrFillResult) => {
    setStoreName(result.storeName)
    setAmount(String(result.amount))
    setReceiptImageUrl(result.receiptImageUrl)
    setOcrRaw(result.ocrRaw)
  }

  const handlePickReceipt = async (source: 'camera' | 'library') => {
    setIsReceiptSourceVisible(false)
    try {
      const uri = await pickReceiptImage(source)
      if (!uri) return
      setReceiptOcrResolver(handleReceiptFilled)
      router.push({
        pathname: '/record/ocr-review',
        params: { tripId, localUri: encodeURIComponent(uri) },
      })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.')
    }
  }

  const handleSelectStore = (result: StoreSearchResult) => {
    setStoreName(result.name)
    setStoreAddress(result.address)
    setStoreLatitude(result.latitude)
    setStoreLongitude(result.longitude)
    setIsStoreSearchVisible(false)
  }

  const amountValue = Number(amount)
  const isAmountValid = amount.length > 0 && Number.isFinite(amountValue) && amountValue > 0
  // 끼니 소비(식비)는 방문 날짜+끼니 때로 특정된 meal_slot에 연결되어야만 저장 가능
  // (F6-4 캐스케이드 확정 RPC가 이 slot id를 필요로 함).
  const mealSlotId = isMeal
    ? (mealSlots.find((slot) => slot.date === visitDate && slot.mealType === mealType)?.id ?? null)
    : null
  const isMealSelectionValid = !isMeal || mealSlotId != null
  const isVisitDateValid = isMeal || visitDate.length > 0
  const canSubmit =
    isAmountValid && category.length > 0 && isMealSelectionValid && isVisitDateValid && !submitting

  const handleSubmit = () => {
    if (!category) return
    onSubmit({
      category,
      amount,
      storeName,
      storeAddress,
      storeLatitude,
      storeLongitude,
      memo,
      mealSlotId,
      visitDate,
      receiptImageUrl,
      ocrRaw,
    })
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>끼니 소비</Text>
          <Switch value={isMeal} onPress={handleToggleMeal} />
        </View>

        <ReceiptUploadBox onPress={handleReceiptUpload} />

        <FormField label="방문 날짜">
          <DropdownField
            placeholder="방문 날짜를 선택하세요"
            options={tripDayOptions}
            value={visitDate}
            onChange={handleVisitDateChange}
          />
        </FormField>

        {isMeal ? (
          <FormField label="끼니 때">
            <DropdownField
              placeholder="끼니를 선택하세요"
              options={availableMealTypeOptions}
              value={mealType}
              onChange={setMealType}
            />
          </FormField>
        ) : null}

        {isMeal ? (
          <>
            <FormField label="매장 이름">
              <PickerField
                value={storeName}
                placeholder="매장 검색하기 (선택)"
                showChevron={false}
                onPress={() => setIsStoreSearchVisible(true)}
              />
            </FormField>

            <FormField label="주소">
              <TextField value={storeAddress} onChangeText={() => {}} disabled />
            </FormField>
          </>
        ) : (
          <FormField label="이용 내역">
            <TextField
              value={storeName}
              onChangeText={setStoreName}
              placeholder="예: 택시, 고속버스터미널 (선택)"
            />
          </FormField>
        )}

        <FormField label="카테고리">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {CATEGORY_OPTIONS.map((option) => {
              const disabled = isMeal ? option !== '식비' : option === '식비'
              return (
                <Chip
                  key={option}
                  text={option}
                  active={category === option}
                  disabled={disabled}
                  onPress={() => setCategory(option)}
                />
              )
            })}
          </ScrollView>
        </FormField>

        <FormField label="금액">
          <TextField
            value={formatDigitsForDisplay(amount)}
            onChangeText={handleAmountChange}
            placeholder="예: 12,000"
            keyboardType="number-pad"
            tailingIcon={<Icon name="krw" size="medium" />}
          />
        </FormField>

        <FormField label="메모">
          <TextField value={memo} onChangeText={setMemo} placeholder="예: 어묵꼬치, 생필품" />
        </FormField>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={submitting ? '저장 중...' : '저장하기'}
          disabled={!canSubmit}
          onPress={handleSubmit}
        />
      </View>

      <StoreSearchModal
        visible={isStoreSearchVisible}
        onClose={() => setIsStoreSearchVisible(false)}
        onSelect={handleSelectStore}
      />


      <RNModal
        visible={isReceiptSourceVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsReceiptSourceVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setIsReceiptSourceVisible(false)} />
        <View style={styles.modalCenter}>
          <Modal
            title="영수증 자동 채우기"
            content="영수증을 어떻게 가져올까요?"
            cancelLabel="촬영하기"
            confirmLabel="사진 선택"
            onCancel={() => handlePickReceipt('camera')}
            onConfirm={() => handlePickReceipt('library')}
          />
        </View>
      </RNModal>

      <RNModal
        visible={isTodayMealCompleteNoticeVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTodayMealCompleteNoticeVisible(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsTodayMealCompleteNoticeVisible(false)}
        />
        <View style={styles.modalCenter}>
          <Modal
            title="오늘 끼니 기록이 완료됐어요"
            content="끼니 기록을 수정하거나 삭제하려면 기록보기 화면에서 진행해주세요."
            confirmLabel="확인"
            onConfirm={() => setIsTodayMealCompleteNoticeVisible(false)}
          />
        </View>
      </RNModal>

      <RNModal
        visible={errorMessage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorMessage(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setErrorMessage(null)} />
        <View style={styles.modalCenter}>
          <Modal
            title="오류"
            content={errorMessage ?? ''}
            confirmLabel="확인"
            onConfirm={() => setErrorMessage(null)}
          />
        </View>
      </RNModal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing[12],
    paddingHorizontal: spacing[16],
    paddingTop: spacing[24],
    paddingBottom: spacing[16],
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  toggleLabel: {
    fontFamily: getFontFamily(typography.title3Emphasized.fontWeight),
    fontSize: typography.title3Emphasized.fontSize,
    lineHeight: typography.title3Emphasized.lineHeight,
    letterSpacing: typography.title3Emphasized.letterSpacing,
    fontWeight: typography.title3Emphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing[10],
  },
  footer: {
    width: '100%',
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surface.neutral.alpha['inverse-alpha-30'],
  },
  modalCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[24],
  },
})
