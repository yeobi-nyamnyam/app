import { useEffect, useState } from "react";
import { Alert, Modal as RNModal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Button,
  FormField,
  Header,
  LoadingOverlay,
  Modal,
  NavBar,
  SegmentedControl,
  Text,
  TextField,
  colors,
  spacing,
  type NavBarItemKey,
} from "@repo/ui";
import { ActiveTripDocument, CreateDiaryDocument, DiaryByDateDocument, TripMealLogsDocument } from "@repo/types";

import { useSession } from "@/hooks/useSession";
import { getTripDates } from "@/lib/budget";
import { todayDate } from "@/lib/format";
import { generateDiaryDraft, type MealLogSummary } from "@/lib/diary";
import { DiaryTextArea } from "@/components/DiaryTextArea";

const MAX_CONTENT_LENGTH = 300;
type DiaryMode = "ai" | "manual";

/**
 * F6 이후 일기(D2, D3) 작성 화면 (Figma "diary-write-ai" / "diary-write-self-corrected").
 * 항상 오늘 날짜 기준으로 diaries를 UNIQUE(trip_id, date)에 맞춰 upsert한다.
 * AI 초안 모드는 오늘 meal_logs를 서버(/diary/draft, D1)로 보내 초안을 생성하고,
 * 생성된 원본에서 한 글자도 안 바뀌면 저장 버튼을 막는다.
 */
export default function DiaryWriteScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tripId: string }>();
  const { session } = useSession();

  const [mode, setMode] = useState<DiaryMode>("ai");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [aiOriginalContent, setAiOriginalContent] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: tripData } = useQuery(ActiveTripDocument, {
    variables: { userId: session?.user.id ?? "" },
    skip: !session,
    fetchPolicy: "cache-and-network",
  });
  const tripNode = tripData?.tripsCollection.edges[0]?.node;
  const dayIndex = tripNode
    ? getTripDates({ startDate: tripNode.start_date, endDate: tripNode.end_date }).indexOf(todayDate())
    : -1;
  const [, month, day] = todayDate().split("-");
  const dayLabel = dayIndex >= 0 ? `${dayIndex + 1}일차 | ${month}.${day}` : `${month}.${day}`;

  const { data: mealLogsData } = useQuery(TripMealLogsDocument, {
    variables: { tripId: params.tripId },
    fetchPolicy: "cache-and-network",
  });
  const todayMealLogs: MealLogSummary[] = (mealLogsData?.meal_logsCollection.edges ?? [])
    .map((edge) => edge.node)
    .filter((log) => log.visit_date === todayDate())
    .map((log) => ({
      storeName: log.store_name ?? null,
      amount: log.amount,
      category: log.category,
      memo: log.memo ?? null,
    }));

  const { data: existingDiaryData } = useQuery(DiaryByDateDocument, {
    variables: { tripId: params.tripId, date: todayDate() },
    fetchPolicy: "cache-and-network",
  });
  // 하루에 한 번만 작성 가능(diaries UNIQUE(trip_id, date)) — 오늘 이미 작성했으면
  // 더 쓰지 못하게 막고 안내 모달만 보여준다.
  const hasExistingDiary = Boolean(existingDiaryData?.diariesCollection.edges[0]?.node);

  const [createDiary, { loading: saving }] = useMutation(CreateDiaryDocument);

  const [selectedTone, setSelectedTone] = useState<"shorter" | "emotional" | "regenerate" | null>(null);

  const runGenerate = async (tone?: "shorter" | "emotional") => {
    if (!session || !tripNode) return;
    setGenerating(true);
    try {
      const draft = await generateDiaryDraft({
        accessToken: session.access_token,
        tripName: tripNode.name,
        dayLabel,
        mealLogs: todayMealLogs,
        tone,
      });
      setContent(draft);
      setAiOriginalContent(draft);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    // 기존 저장된 일기가 없고, AI 탭이 기본 선택된 첫 진입에서만 자동 생성한다.
    // mealLogsData가 아직 로딩 중일 때 생성하면 빈 목록으로 초안을 만들어버리므로
    // 쿼리가 끝날 때까지 기다린다.
    if (hasExistingDiary || content || !session || !tripNode || !mealLogsData || mode !== "ai") return;
    runGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, tripNode, mode, mealLogsData]);

  const handleModeChange = (index: 0 | 1) => {
    const nextMode: DiaryMode = index === 0 ? "ai" : "manual";
    setMode(nextMode);
    if (nextMode === "ai" && !content && !generating && mealLogsData) {
      runGenerate();
    }
  };

  const isAiUntouched = mode === "ai" && aiOriginalContent !== null && content === aiOriginalContent;
  const canSave = content.trim().length > 0 && !isAiUntouched && !saving && !generating;

  const handleSave = async () => {
    if (!canSave) return;
    try {
      await createDiary({
        variables: { tripId: params.tripId, date: todayDate(), mode, title: title || null, content },
      });
      router.back();
    } catch (error) {
      Alert.alert("저장 실패", error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
    }
  };

  const handleNavChange = (key: NavBarItemKey) => {
    if (key === "home") {
      router.push("/");
      return;
    }
    if (key === "recommend") {
      router.push("/recommend");
      return;
    }
    if (key === "chat") {
      router.push("/chat");
      return;
    }
    if (key === "record") {
      router.push("/record");
      return;
    }
    if (key === "profile") {
      router.push("/mypage");
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="여행 일기 작성" topInset={insets.top} onBackPress={() => router.back()} />

      {!hasExistingDiary ? (
        <>
          <View style={styles.segmentWrap}>
            <SegmentedControl options={["AI 초안", "직접 쓰기"]} selectedIndex={mode === "ai" ? 0 : 1} onChange={handleModeChange} />
          </View>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
            <FormField label={dayLabel}>
              <TextField value={title} onChangeText={setTitle} placeholder="제목" />
            </FormField>

            <DiaryTextArea
              value={content}
              onChangeText={setContent}
              maxLength={MAX_CONTENT_LENGTH}
              editable={!generating}
              generating={generating}
              badgeLabel={mode === "ai" ? "AI 초안이에요. 직접 수정 후 저장할 수 있어요." : undefined}
              toneActions={
                mode === "ai"
                  ? [
                      {
                        label: "더 짧게",
                        active: selectedTone === "shorter",
                        onPress: () => {
                          setSelectedTone("shorter");
                          runGenerate("shorter");
                        },
                      },
                      {
                        label: "감성적으로",
                        active: selectedTone === "emotional",
                        onPress: () => {
                          setSelectedTone("emotional");
                          runGenerate("emotional");
                        },
                      },
                      {
                        label: "다시 생성",
                        active: selectedTone === "regenerate",
                        onPress: () => {
                          setSelectedTone("regenerate");
                          runGenerate();
                        },
                      },
                    ]
                  : undefined
              }
            />

            {mode === "ai" ? (
              <Text variant="footnoteRegular" color="subtle">
                초안을 한 곳이라도 고쳐야 저장할 수 있어요. 기록이 부족하면 초안 생성이 어려울 수 있어요.
              </Text>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Button label={saving ? "저장 중..." : "저장"} disabled={!canSave} onPress={handleSave} />
          </View>
          <View style={{ paddingBottom: insets.bottom }}>
            <NavBar active="record" onChange={handleNavChange} />
          </View>
        </>
      ) : null}

      <RNModal
        visible={errorMessage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorMessage(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setErrorMessage(null)} />
        <View style={styles.dialogCenter}>
          <Modal title="오류" content={errorMessage ?? ""} confirmLabel="확인" onConfirm={() => setErrorMessage(null)} />
        </View>
      </RNModal>

      <RNModal visible={hasExistingDiary} transparent animationType="fade" onRequestClose={() => router.back()}>
        <Pressable style={styles.backdrop} onPress={() => router.back()} />
        <View style={styles.dialogCenter}>
          <Modal
            title="오늘 일기 작성을 완료했어요"
            content="일기는 하루에 한 번만 작성할 수 있어요. 내일 다시 작성해주세요."
            confirmLabel="확인"
            onConfirm={() => router.back()}
          />
        </View>
      </RNModal>

      {generating || saving ? <LoadingOverlay label={generating ? "생성 중..." : "저장 중..."} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  segmentWrap: {
    paddingHorizontal: spacing[16],
    paddingTop: spacing[24],
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing[16],
    gap: spacing[8],
  },
  footer: {
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surface.neutral.alpha["inverse-alpha-30"],
  },
  dialogCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[24],
  },
});
