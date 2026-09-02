import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
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

import { searchPlaces } from "@/lib/places";

export interface StoreSearchResult {
  name: string;
  address: string;
}

const SEARCH_DEBOUNCE_MS = 300;

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

/**
 * 매장 이름/주소 자동완성 검색 바텀시트 (F6-10, 네이버 지역 검색 API 경유). 매장명으로
 * 검색하거나 도로명 주소로 검색하는 두 가지 진입 방식을 탭으로 나눠 보여주지만, 실제로는
 * 같은 검색 API가 매장명/주소 텍스트를 모두 매칭해줘서 동일한 엔드포인트를 호출한다.
 * 타이핑마다 바로 호출하지 않도록 디바운스를 둔다.
 */
export const StoreSearchModal = ({ visible, onClose, onSelect }: StoreSearchModalProps) => {
  const insets = useSafeAreaInsets();
  const [modeIndex, setModeIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StoreSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setHasError(false);
      return;
    }

    setIsSearching(true);
    setHasError(false);
    const timeoutId = setTimeout(async () => {
      try {
        const nextResults = await searchPlaces(trimmed);
        setResults(nextResults);
      } catch {
        setResults([]);
        setHasError(true);
      } finally {
        setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [query]);

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
            isSearching ? (
              <ActivityIndicator style={styles.emptyText} color={colors.content.neutral.subtlest} />
            ) : (
              <Text style={styles.emptyText}>
                {query.trim().length === 0
                  ? "매장명 또는 도로명 주소로 검색해보세요"
                  : hasError
                    ? "검색에 실패했어요. 잠시 후 다시 시도해주세요"
                    : "검색 결과가 없어요"}
              </Text>
            )
          }
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
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
