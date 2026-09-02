import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Redirect, router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  ChatBubble,
  ChatInputBar,
  ChatRecordSheet,
  Header,
  NavBar,
  Text,
  colors,
  spacing,
  type ChatBubbleProps,
  type NavBarItemKey,
} from "@repo/ui";
import {
  ActiveTripDocument,
  CreateMealLogDocument,
  InsertChatMessageDocument,
  UpdateChatMessageStatusDocument,
} from "@repo/types";
import type { MealLogCategory } from "@/components/RecordForm";

import { formatWon, todayDate } from "@/lib/format";
import { MEAL_TYPES, MEAL_TYPE_LABEL, type MealType } from "@/lib/budget";
import {
  formatChatTime,
  streamChatReply,
  type ChatHistoryItem,
  type ChatParsedResult,
} from "@/lib/chat";
import { useSession } from "@/hooks/useSession";

// Figma 카테고리 라벨("숙소")과 달리 DB CHECK 제약(schema-design.md §4)은 '숙박'이라,
// 실제 저장값(RecordForm과 동일한 MealLogCategory)을 그대로 라벨로 쓴다.
const CATEGORY_OPTIONS: { label: string; value: MealLogCategory }[] = [
  { label: "교통", value: "교통" },
  { label: "숙박", value: "숙박" },
  { label: "기념품", value: "기념품" },
  { label: "기타", value: "기타" },
];

const handleNavChange = (key: NavBarItemKey) => {
  if (key === "chat") return;
  if (key === "home") {
    router.push("/");
    return;
  }
  if (key === "recommend") {
    router.push("/recommend");
    return;
  }
  if (key === "record") {
    router.push("/record");
    return;
  }
  if (key === "profile") {
    router.push("/mypage");
    return;
  }
  Alert.alert("준비 중", "아직 구현되지 않은 탭이에요.");
};

/**
 * 채팅 대화 화면 (Figma "chat-waiting"/"chat-add-edit"/"chat-confirmed-spent").
 * 채팅 로그 목록 화면(`/chat`)의 "대화 하기" 버튼으로 진입한다.
 */
export default function ChatConversationScreen() {
  const { session } = useSession();
  const { data, loading, refetch } = useQuery(ActiveTripDocument, {
    variables: { userId: session?.user.id ?? "" },
    skip: !session,
    fetchPolicy: "cache-and-network",
  });

  // 기록 화면(F6-1 chat 경로)에서 실제로 소비를 저장하고 돌아왔을 때 오늘 남은 식비를
  // 최신 값으로 다시 받아오기 위함 — F6-4(캐스케이드) 전까지는 식비 저장 자체가 막혀
  // 있어 지금은 값이 바뀔 일이 없지만, 풀리면 이 refetch만으로 자동으로 반영된다.
  useFocusEffect(
    useCallback(() => {
      if (session) void refetch();
    }, [session, refetch]),
  );

  if (loading && !data) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContent}>
          <Text color="subtlest">여행 정보 불러오는 중...</Text>
        </View>
        <NavBar active="chat" onChange={handleNavChange} />
      </View>
    );
  }

  const tripNode = data?.tripsCollection.edges[0]?.node;
  if (!tripNode || !session) {
    return <Redirect href="/chat" />;
  }

  const today = todayDate();
  const todaySlots = (tripNode.meal_slotsCollection?.edges ?? [])
    .map((edge) => edge.node)
    .filter((slot) => slot.date === today);
  const dayBudget = todaySlots.reduce((sum, slot) => sum + slot.budget_amount, 0);
  const consumed = todaySlots.reduce((sum, slot) => sum + (slot.recorded_amount ?? 0), 0);
  // F6-4 캐스케이드 확정분(0원)도 is_recorded=true라 오늘 끼니가 전부 막혔는지 여기서 같이 판단된다.
  const allMealsRecorded =
    todaySlots.length === MEAL_TYPES.length && todaySlots.every((slot) => slot.is_recorded);
  const recordedMealTypes = todaySlots
    .filter((slot) => slot.is_recorded)
    .map((slot) => slot.meal_type as MealType);

  return (
    <ActiveConversation
      tripId={tripNode.id}
      tripName={tripNode.name}
      userId={session.user.id}
      dayBudget={dayBudget}
      consumed={consumed}
      allMealsRecorded={allMealsRecorded}
      recordedMealTypes={recordedMealTypes}
    />
  );
}

interface PendingExpense {
  category: MealLogCategory;
  amount: string;
  chatMessageId: string | null;
}

function ActiveConversation({
  tripId,
  tripName,
  userId,
  dayBudget,
  consumed,
  allMealsRecorded,
  recordedMealTypes,
}: {
  tripId: string;
  tripName: string;
  userId: string;
  dayBudget: number;
  consumed: number;
  allMealsRecorded: boolean;
  recordedMealTypes: MealType[];
}) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const remaining = Math.max(dayBudget - consumed, 0);
  const [insertChatMessage] = useMutation(InsertChatMessageDocument);
  const [updateChatMessageStatus] = useMutation(UpdateChatMessageStatusDocument);
  const [createMealLog] = useMutation(CreateMealLogDocument);

  const [messages, setMessages] = useState<(ChatBubbleProps & { id: string })[]>(() => [
    {
      id: "greeting",
      sender: "ai",
      text:
        consumed > 0
          ? `오늘 ${formatWon(consumed)} 썼어요. 남은 식비는 ${formatWon(remaining)}이에요!`
          : `오늘 식비 예산은 ${formatWon(dayBudget)}이에요. 얼마 썼는지 편하게 말해주세요!`,
    },
  ]);
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [pendingExpense, setPendingExpense] = useState<PendingExpense | null>(null);

  const appendMessage = (message: ChatBubbleProps & { id: string }) => {
    setMessages((prev) => [...prev, message]);
  };

  // "새 추천 보기" 카드는 실제로 오늘 남은 식비가 줄었을 때만 띄운다. 파싱 직후가
  // 아니라, 기록 화면에서 실제로 저장하고 돌아와 remaining이 진짜로 감소했을 때만
  // (부모의 useFocusEffect가 refetch → 이 값이 갱신됨) 반응한다.
  const previousRemainingRef = useRef(remaining);
  useEffect(() => {
    if (remaining < previousRemainingRef.current) {
      appendMessage({
        id: `ai-recommend-${Date.now()}`,
        sender: "ai",
        variant: "cta",
        title: formatWon(remaining),
        description: "오늘 남은 식비가 줄었어요. 추천에서 다시 골라보세요.",
        buttonLabel: "새 추천 보기",
        onButtonPress: () => Alert.alert("준비 중", "추천 화면은 아직 준비 중이에요."),
      });
    }
    previousRemainingRef.current = remaining;
  }, [remaining]);

  // 끼니 소비(식비)는 슬롯 연결·캐스케이드 확정(F6-4)이 아직 없어 RecordForm에서도
  // 저장을 막아둔 상태라, 채팅에서 확정하지 않고 기록 화면(F6-1 chat 경로)으로 보낸다.
  // 채팅은 항상 "지금, 오늘" 맥락이라 방문 날짜는 항상 오늘로 채워 보낸다.
  const goToRecordScreen = (options: {
    amount?: string;
    category?: MealLogCategory;
    mealType?: MealType | null;
  }) => {
    const params = new URLSearchParams({ tripId, source: "chat", presetVisitDate: todayDate() });
    if (options.amount) params.set("presetAmount", options.amount);
    if (options.category) params.set("presetCategory", options.category);
    if (options.mealType) params.set("presetMealType", options.mealType);
    setPendingExpense(null);
    router.push(`/record/new?${params.toString()}`);
  };

  const handleParsedResult = async (userText: string, result: ChatParsedResult, waitingId: string) => {
    const isNonMealExpense = result.hasExpense && result.category != null && result.category !== "식비";
    // 소비로 파싱되면(끼니든 아니든) 그 다음 뜨는 CTA 카드/기록 시트가 이미 같은 내용을
    // 담고 있어서, Gemini의 대화체 reply 버블은 굳이 같이 안 보여준다. 파싱 안 된
    // 일반 대화·재질문일 때만 스트리밍된 텍스트 버블을 그대로 남겨둔다.
    const willShowStructuredUi = result.hasExpense && result.category != null && result.amount != null;
    if (willShowStructuredUi) {
      setMessages((prev) => prev.filter((item) => item.id !== waitingId));
    }

    let userMessageId: string | null = null;
    try {
      const { data } = await insertChatMessage({
        variables: {
          tripId,
          userId,
          role: "user",
          content: userText,
          parsedCategory: result.category,
          parsedAmount: result.amount,
          status: isNonMealExpense ? "pending" : "confirmed",
        },
      });
      userMessageId = data?.insertIntochat_messagesCollection?.records[0]?.id ?? null;
    } catch {
      // chat_messages 기록 실패로 대화 흐름 자체를 막지 않는다.
    }

    try {
      await insertChatMessage({
        variables: {
          tripId,
          userId,
          role: "ai",
          content: result.reply,
          parsedCategory: null,
          parsedAmount: null,
          status: "confirmed",
        },
      });
    } catch {
      // 위와 동일한 이유로 무시.
    }

    setHistory((prev) => [...prev, { role: "user", text: userText }, { role: "ai", text: result.reply }]);

    if (!result.hasExpense || result.category == null || result.amount == null) {
      return;
    }

    if (result.category === "식비") {
      // 오늘 끼니가 이미 전부 기록(캐스케이드 확정 포함)됐으면 새로 끼니를 끼워넣을
      // 슬롯 자체가 없다 — 기록 화면으로 보내봤자 "끼니 때" 선택지가 없어 막히므로
      // (RecordForm.tsx의 availableMealTypeOptions) 여기서 먼저 안내한다.
      if (allMealsRecorded) {
        appendMessage({
          id: `ai-locked-${Date.now()}`,
          sender: "ai",
          text: "오늘 끼니 기록은 이미 다 끝났어요. 이 지출은 저장할 수 없어요 — 수정하려면 기록보기에서 오늘 기록을 삭제한 뒤 순서대로 다시 입력해주세요.",
        });
        return;
      }
      // 메시지에서 끼니 때(아침/점심/저녁)가 특정됐는데 그 끼니가 이미 기록돼 있으면
      // (다른 끼니는 안 끝났어도) 그 끼니로는 더 기록할 슬롯이 없으므로 마찬가지로 막는다.
      if (result.mealType && recordedMealTypes.includes(result.mealType)) {
        appendMessage({
          id: `ai-locked-${Date.now()}`,
          sender: "ai",
          text: `오늘 ${MEAL_TYPE_LABEL[result.mealType]} 기록은 이미 있어요. 수정하려면 기록보기에서 오늘 기록을 삭제한 뒤 다시 입력해주세요.`,
        });
        return;
      }
      // "새 추천 보기" 카드는 여기서 바로 띄우지 않는다 — 사용자가 기록 화면에서
      // 실제로 저장하고 돌아와 오늘 남은 식비가 진짜로 줄었을 때만
      // (위 useFocusEffect + useEffect가 감지) 뜨도록 분리했다.
      appendMessage({
        id: `ai-cta-${Date.now()}`,
        sender: "ai",
        variant: "cta",
        description: `${formatWon(result.amount)} 썼군요! 끼니 소비는 채팅에서 바로 저장할 수 없어서, 기록 화면에서 확인하고 남겨주세요.`,
        buttonLabel: "메뉴 기록",
        onButtonPress: () =>
          goToRecordScreen({ amount: String(result.amount), category: "식비", mealType: result.mealType }),
      });
      return;
    }

    setPendingExpense({ category: result.category, amount: String(result.amount), chatMessageId: userMessageId });
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    const waitingId = `ai-${Date.now()}`;
    appendMessage({ id: `user-${Date.now()}`, sender: "user", text });
    appendMessage({ id: waitingId, sender: "ai", variant: "waiting" });

    await streamChatReply({
      tripName,
      todayBudget: dayBudget,
      todayConsumed: consumed,
      message: text,
      history,
      onToken: (accumulated) => {
        setMessages((prev) =>
          prev.map((item) => (item.id === waitingId ? { ...item, variant: "text", text: accumulated } : item)),
        );
      },
      onDone: (result) => {
        void handleParsedResult(text, result, waitingId);
      },
      onError: (error) => {
        setMessages((prev) => prev.filter((item) => item.id !== waitingId));
        appendMessage({ id: `ai-error-${Date.now()}`, sender: "ai", text: error.message });
      },
    });
  };

  const handleConfirm = async () => {
    if (!pendingExpense) return;
    const amount = Number(pendingExpense.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;

    try {
      await createMealLog({
        variables: {
          tripId,
          mealSlotId: null,
          category: pendingExpense.category,
          amount,
          storeName: null,
          storeAddress: null,
          memo: null,
          source: "chat",
          visitDate: todayDate(),
        },
      });
      if (pendingExpense.chatMessageId) {
        await updateChatMessageStatus({
          variables: { id: pendingExpense.chatMessageId, status: "confirmed" },
        });
      }
      appendMessage({
        id: `confirmed-${Date.now()}`,
        sender: "ai",
        variant: "confirmed",
        categoryLabel: pendingExpense.category,
        time: formatChatTime(new Date()),
        price: amount.toLocaleString("ko-KR"),
      });
      setPendingExpense(null);
    } catch (error) {
      Alert.alert("저장 실패", error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.");
    }
  };

  const handleDismissPending = () => {
    if (pendingExpense?.chatMessageId) {
      updateChatMessageStatus({
        variables: { id: pendingExpense.chatMessageId, status: "discarded" },
      }).catch(() => {
        // 폐기 상태 반영 실패는 조용히 무시 — 사용자 흐름을 막을 정도의 오류가 아님.
      });
    }
    setPendingExpense(null);
  };

  return (
    <View style={styles.container}>
      <Header
        title={tripName}
        tailing="text"
        tailingText={`오늘 남은 식비 ${formatWon(remaining)}`}
        topInset={insets.top}
        onBackPress={() => router.back()}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(({ id, ...bubble }) => (
          <ChatBubble key={id} {...bubble} />
        ))}
      </ScrollView>
      <ChatInputBar value={inputValue} onChangeText={setInputValue} onSend={() => void handleSend()} />
      <View style={{ paddingBottom: insets.bottom }}>
        <NavBar active="chat" onChange={handleNavChange} />
      </View>
      <Modal
        visible={pendingExpense != null}
        animationType="slide"
        transparent
        onRequestClose={handleDismissPending}
      >
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleDismissPending} />
          {pendingExpense ? (
            <View style={{ paddingBottom: insets.bottom }}>
              <ChatRecordSheet
                title="끼니 기록"
                onTitlePress={() =>
                  goToRecordScreen({ amount: pendingExpense.amount, category: pendingExpense.category })
                }
                categories={CATEGORY_OPTIONS}
                selectedCategory={pendingExpense.category}
                onSelectCategory={(value) =>
                  setPendingExpense((prev) =>
                    prev ? { ...prev, category: value as MealLogCategory } : prev,
                  )
                }
                amount={pendingExpense.amount}
                onChangeAmount={(value) =>
                  setPendingExpense((prev) =>
                    prev ? { ...prev, amount: value.replace(/[^0-9]/g, "") } : prev,
                  )
                }
                onSubmit={() => void handleConfirm()}
              />
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  emptyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[16],
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    gap: spacing[8],
    padding: spacing[16],
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});
