import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  TextField,
  UnderlineTabs,
  colors,
  getFontFamily,
  radius,
  spacing,
  stroke,
  typography,
} from "@repo/ui";

export interface StoreSearchResult {
  name: string;
  address: string;
}

/**
 * @param visible 모달이 열려있는지: true | false
 * @param onClose 모달을 닫을 때 발생하는 event 명시 (배경 탭, 결과 선택 후)
 * @param onSelect 검색 결과를 선택했을 때 발생하는 event 명시, 선택한 결과를 전달
 */
export interface StoreSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (result: StoreSearchResult) => void;
}

const MODE_TABS = ["매장명으로 찾기", "주소로 찾기"];

// TODO(F6-10): 네이버/카카오 지도 검색 API 연동 전까지의 자리표시 목데이터.
// 실제 API가 붙으면 이 배열과 아래 필터링 로직을 API 호출로 교체한다.
const MOCK_RESULTS: StoreSearchResult[] = [
  { name: "제주 흑돼지 본가", address: "제주특별자치도 제주시 노형동 123-4" },
  { name: "우진해장국", address: "제주특별자치도 제주시 삼도이동 55-1" },
  { name: "만장굴 매점", address: "제주특별자치도 제주시 구좌읍 만장굴길 182" },
  { name: "성산일출봉 분식", address: "제주특별자치도 서귀포시 성산읍 일출로 284" },
  { name: "협재해수욕장 카페", address: "제주특별자치도 제주시 한림읍 협재리 2497" },
  { name: "동문시장 야시장", address: "제주특별자치도 제주시 이도이동 20-8" },
];

/**
 * 매장 이름/주소 자동완성 검색 바텀시트 (F6-10 자리표시 프로토타입). 매장명으로
 * 검색하거나 도로명 주소로 검색하는 두 가지 진입 방식을 탭으로 나눠 보여주고,
 * 결과를 고르면 이름·주소를 함께 채운다. 실제 카카오/네이버 지도 검색 API가
 * 붙기 전까지는 목데이터를 클라이언트에서 필터링한다.
 */
export const StoreSearchModal = ({ visible, onClose, onSelect }: StoreSearchModalProps) => {
  const insets = useSafeAreaInsets();
  const [modeIndex, setModeIndex] = useState(0);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query) return [];
    const keyword = query.trim().toLowerCase();
    return MOCK_RESULTS.filter((result) => {
      const target = modeIndex === 0 ? result.name : result.address;
      return target.toLowerCase().includes(keyword);
    });
  }, [query, modeIndex]);

  const handleSelect = (result: StoreSearchResult) => {
    onSelect(result);
    setQuery("");
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: spacing[16] + insets.bottom }]}>
        <View style={styles.grabber} />
        <Text style={styles.title}>매장 검색</Text>
        <UnderlineTabs tabs={MODE_TABS} activeIndex={modeIndex} onChange={setModeIndex} />
        <View style={styles.searchField}>
          <TextField
            value={query}
            onChangeText={setQuery}
            placeholder={modeIndex === 0 ? "매장명을 입력하세요" : "도로명 주소를 입력하세요"}
          />
        </View>
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.name}-${item.address}`}
          contentContainerStyle={styles.resultList}
          renderItem={({ item }) => (
            <Pressable style={styles.resultRow} onPress={() => handleSelect(item)}>
              <Text style={styles.resultName}>{item.name}</Text>
              <Text style={styles.resultAddress}>{item.address}</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {query.length === 0
                ? "매장명 또는 도로명 주소로 검색해보세요"
                : "검색 결과가 없어요"}
            </Text>
          }
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface.neutral.alpha["inverse-alpha-30"],
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "80%",
    borderTopLeftRadius: radius[20],
    borderTopRightRadius: radius[20],
    backgroundColor: colors.surface.neutral.default,
  },
  grabber: {
    alignSelf: "center",
    width: 36,
    height: 4,
    marginTop: spacing[8],
    borderRadius: radius.full,
    backgroundColor: colors.surface.neutral.bold,
  },
  title: {
    paddingTop: spacing[12],
    paddingBottom: spacing[8],
    paddingHorizontal: spacing[16],
    textAlign: "center",
    fontFamily: getFontFamily(typography.title3Emphasized.fontWeight),
    fontSize: typography.title3Emphasized.fontSize,
    lineHeight: typography.title3Emphasized.lineHeight,
    letterSpacing: typography.title3Emphasized.letterSpacing,
    fontWeight: typography.title3Emphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  searchField: {
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
  },
  resultList: {
    paddingHorizontal: spacing[16],
  },
  resultRow: {
    gap: spacing[2],
    paddingVertical: spacing[12],
    borderBottomWidth: stroke.default,
    borderBottomColor: colors.border.neutral.subtle,
  },
  resultName: {
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: typography.bodyEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  resultAddress: {
    fontFamily: getFontFamily(typography.footnoteRegular.fontWeight),
    fontSize: typography.footnoteRegular.fontSize,
    lineHeight: typography.footnoteRegular.lineHeight,
    letterSpacing: typography.footnoteRegular.letterSpacing,
    fontWeight: typography.footnoteRegular.fontWeight,
    color: colors.content.neutral.subtlest,
  },
  emptyText: {
    paddingTop: spacing[24],
    textAlign: "center",
    fontFamily: getFontFamily(typography.bodyRegular.fontWeight),
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    fontWeight: typography.bodyRegular.fontWeight,
    color: colors.content.neutral.subtlest,
  },
});
