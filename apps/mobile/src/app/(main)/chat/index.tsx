import { useRef, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChatBubble,
  ChatInputBar,
  ChatRecordSheet,
  EmptyTripPrompt,
  Header,
  NavBar,
  colors,
  spacing,
  type ChatBubbleProps,
  type NavBarItemKey,
} from "@repo/ui";
import type { MealLogCategory } from "@/components/RecordForm";

import { formatWon } from "@/lib/format";
import { formatChatTime, parseChatExpense } from "@/lib/chat";

interface ActiveTrip {
  id: string;
  name: string;
}

// TODO(C0 API 연동): 실제 여행/예산 데이터 연동 전까지 쓰는 목데이터. F1/F2가 화면을
// 먼저 만들고 나중에 ActiveTripDocument 쿼리를 붙인 것과 동일한 흐름으로 이어간다.
const MOCK_HAS_ACTIVE_TRIP = true;
const MOCK_TRIP: ActiveTrip = { id: "00000000-0000-0000-0000-000000000000", name: "친구들과 대구 여행" };
const MOCK_DAY_BUDGET = 45000;
const MOCK_CONSUMED = 13000;

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

export default function ChatScreen() {
  if (!MOCK_HAS_ACTIVE_TRIP) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContent}>
          <EmptyTripPrompt
            onCreateTrip={() => router.push("/trip-create")}
            onLoadPastTrip={() =>
              Alert.alert("준비 중", "과거 여행 불러오기는 아직 준비 중이에요.")
            }
          />
        </View>
        <NavBar active="chat" onChange={handleNavChange} />
      </View>
    );
  }

  return (
    <ChatConversation trip={MOCK_TRIP} dayBudget={MOCK_DAY_BUDGET} consumed={MOCK_CONSUMED} />
  );
}

function ChatConversation({
  trip,
  dayBudget,
  consumed,
}: {
  trip: ActiveTrip;
  dayBudget: number;
  consumed: number;
}) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  // 채팅에서 지금 저장할 수 있는 카테고리(교통/숙박/기념품/기타)는 "오늘 남은 식비"와
  // 무관한 별도 예산이라, 확정해도 이 값은 바뀌지 않는다 (식비 소비만 차감 대상).
  const remaining = Math.max(dayBudget - consumed, 0);

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
  const [inputValue, setInputValue] = useState("");
  const [pendingExpense, setPendingExpense] = useState<{
    category: MealLogCategory;
    amount: string;
  } | null>(null);

  const appendMessage = (message: ChatBubbleProps & { id: string }) => {
    setMessages((prev) => [...prev, message]);
  };

  // 끼니 소비(식비)는 슬롯 연결·캐스케이드 확정(F6-4)이 아직 없어 RecordForm에서도
  // 저장을 막아둔 상태라, 채팅에서 확정하지 않고 기록 화면(F6-1 chat 경로)으로 보낸다.
  // ChatRecordSheet의 카테고리엔 애초에 "식비"가 없어서, AI가 식비를 다른 카테고리로
  // 잘못 인식했을 때도 시트의 "끼니 기록" 버튼으로 여기로 빠져나올 수 있다.
  const goToRecordScreen = (amount?: string) => {
    const params = new URLSearchParams({ tripId: trip.id, source: "chat" });
    if (amount) params.set("presetAmount", amount);
    setPendingExpense(null);
    router.push(`/record/new?${params.toString()}`);
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    appendMessage({ id: `user-${Date.now()}`, sender: "user", text });
    appendMessage({ id: "waiting", sender: "ai", variant: "waiting" });

    // 실제 LLM 응답(C1) 전까지는 로컬 파싱 결과를 잠깐의 대기 후 보여준다.
    setTimeout(() => {
      const parsed = parseChatExpense(text);
      setMessages((prev) => prev.filter((message) => message.id !== "waiting"));

      if (!parsed) {
        appendMessage({
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: '얼마 썼는지 숫자로 다시 말해줄래요? 예) "택시비 12000원 냈어"',
        });
        return;
      }

      if (parsed.category === "식비") {
        // 이 분기에 오는 시점엔 금액은 항상 파싱돼 있다(금액을 못 찾으면 위에서 먼저
        // 다시 물어봄). "얼마 썼는지 말해달라"는 고정 문구 대신 방금 말한 금액을
        // 그대로 인지했다는 걸 보여줘야, "저녁으로 13000원 썼어" 같은 문장에도 어색하지
        // 않다.
        appendMessage({
          id: `ai-${Date.now()}`,
          sender: "ai",
          variant: "cta",
          description: `${formatWon(parsed.amount)} 썼군요! 끼니 소비는 채팅에서 바로 저장할 수 없어서, 기록 화면에서 확인하고 남겨주세요.`,
          buttonLabel: "메뉴 기록",
          onButtonPress: () => goToRecordScreen(String(parsed.amount)),
        });
        return;
      }

      setPendingExpense({ category: parsed.category, amount: String(parsed.amount) });
    }, 500);
  };

  const handleConfirm = () => {
    if (!pendingExpense) return;
    const amount = Number(pendingExpense.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;

    // 목데이터 단계라 실제로 저장하지는 않는다. API 연동 이슈에서 CreateMealLog
    // 뮤테이션(source='chat')으로 교체한다.
    appendMessage({
      id: `confirmed-${Date.now()}`,
      sender: "ai",
      variant: "confirmed",
      categoryLabel: pendingExpense.category,
      time: formatChatTime(new Date()),
      price: amount.toLocaleString("ko-KR"),
    });
    setPendingExpense(null);
  };

  return (
    <View style={styles.container}>
      <Header
        title={trip.name}
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
      <ChatInputBar value={inputValue} onChangeText={setInputValue} onSend={handleSend} />
      <View style={{ paddingBottom: insets.bottom }}>
        <NavBar active="chat" onChange={handleNavChange} />
      </View>
      <Modal
        visible={pendingExpense != null}
        animationType="slide"
        transparent
        onRequestClose={() => setPendingExpense(null)}
      >
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPendingExpense(null)} />
          {pendingExpense ? (
            <View style={{ paddingBottom: insets.bottom }}>
              <ChatRecordSheet
                title="끼니 기록"
                onTitlePress={() => goToRecordScreen(pendingExpense.amount)}
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
                onSubmit={handleConfirm}
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
