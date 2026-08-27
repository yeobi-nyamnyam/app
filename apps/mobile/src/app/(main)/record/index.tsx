import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CTACard, NavBar, Text, UnderlineTabs, colors, spacing, type NavBarItemKey } from "@repo/ui";

// TODO: F1(여행 생성)이 붙으면 실제 진행 중인 tripId로 교체
const PLACEHOLDER_TRIP_ID = "00000000-0000-0000-0000-000000000000";

const TABS = ["기록 작성하기", "기록보기"];

/**
 * 기록 탭 진입 화면 (Figma "write"). 소비 기록/여행 일기 작성 진입점 + 기록보기 탭.
 * 일기(D0~D3)는 기록 기능 개발이 끝난 뒤 별도로 작업하므로 여기서는 진입 버튼만 둔다.
 * "기록보기"(F6-8/F6-9 목록 조회)는 아직 화면이 없어 자리만 마련해둔다.
 */
export default function RecordWriteScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);

  const handleNavChange = (key: NavBarItemKey) => {
    if (key === "record") return;
    if (key === "home") {
      router.push("/");
      return;
    }
    Alert.alert("준비 중", "아직 구현되지 않은 탭이에요.");
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <UnderlineTabs tabs={TABS} activeIndex={activeTab} onChange={setActiveTab} />
      {activeTab === 0 ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text>오늘의 소비와 여행 일기를 남겨보세요</Text>
          <CTACard
            title="소비 기록 작성"
            description="끼니 소비와 기타 소비를 기록해보세요"
            buttonLabel="작성하기"
            onPress={() => router.push(`/record/new?tripId=${PLACEHOLDER_TRIP_ID}`)}
          />
          <CTACard
            title="여행 일기 작성"
            description="오늘 하루의 여행을 글로 남겨보세요"
            buttonLabel="작성하기"
            onPress={() => Alert.alert("준비 중", "일기 기능은 기록 개발 완료 후 추가돼요.")}
          />
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text color="subtlest">기록보기는 준비 중이에요.</Text>
        </View>
      )}
      <View style={{ paddingBottom: insets.bottom }}>
        <NavBar active="record" onChange={handleNavChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  content: {
    padding: spacing[16],
    gap: spacing[12],
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
