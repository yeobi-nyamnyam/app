import EventSource from "react-native-sse";
import { supabase } from "@/lib/supabase";
import type { MealLogCategory } from "@/components/RecordForm";
import type { MealType } from "@/lib/budget";

// apps/server 채팅 SSE 엔드포인트. lib/account.ts와 동일한 패턴.
const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:4000";

export type ChatRole = "user" | "ai";

export interface ChatHistoryItem {
  role: ChatRole;
  text: string;
}

export interface ChatParsedResult {
  reply: string;
  hasExpense: boolean;
  amount: number | null;
  category: MealLogCategory | null;
  mealType: MealType | null;
}

/**
 * @param tripName 오늘 진행 중인 여행 이름 (프롬프트 컨텍스트용)
 * @param todayBudget 오늘 남은 식비 계산에 쓰는 오늘의 식비 예산
 * @param todayConsumed 오늘 지금까지 소비한 금액
 * @param message 사용자가 방금 보낸 메시지
 * @param history 이번 대화 화면에서 지금까지 주고받은 턴 (매번 새 세션이라 과거 세션은 포함 안 함)
 * @param onToken AI 응답이 스트리밍될 때마다 지금까지 누적된 전체 텍스트를 넘겨준다
 * @param onDone 서버가 검증한 최종 파싱 결과를 넘겨준다
 * @param onError 인증 실패/네트워크 오류/서버 오류 시 호출된다
 *
 * apps/server의 POST /chat SSE 엔드포인트를 호출해 AI 응답을 스트리밍으로 받는다.
 */
export async function streamChatReply({
  tripName,
  todayBudget,
  todayConsumed,
  message,
  history,
  onToken,
  onDone,
  onError,
}: {
  tripName: string;
  todayBudget: number;
  todayConsumed: number;
  message: string;
  history: ChatHistoryItem[];
  onToken: (accumulatedText: string) => void;
  onDone: (result: ChatParsedResult) => void;
  onError: (error: Error) => void;
}): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) {
    onError(new Error("로그인이 필요합니다."));
    return;
  }

  let accumulated = "";
  const es = new EventSource<"token" | "done">(`${serverUrl}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ tripName, todayBudget, todayConsumed, message, history }),
  });

  es.addEventListener("token", (event) => {
    if (event.data == null) return;
    accumulated += JSON.parse(event.data) as string;
    onToken(accumulated);
  });

  es.addEventListener("done", (event) => {
    if (event.data) {
      onDone(JSON.parse(event.data) as ChatParsedResult);
    } else {
      onError(new Error("AI 응답을 받아오지 못했습니다."));
    }
    es.close();
  });

  es.addEventListener("error", (event) => {
    const message = "message" in event ? event.message : "AI 응답을 받아오지 못했습니다.";
    onError(new Error(message));
    es.close();
  });
}

/**
 * @param date 시각을 표시할 Date 객체
 */
export const formatChatTime = (date: Date): string =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

export type ChatLogFilterCategory = "식비" | "기타소비";

/**
 * @param category meal_logs.category 값
 * 채팅 로그 목록의 "전체/식비/기타소비" 필터 칩과 맞추기 위한 매핑.
 */
export const toChatLogFilterCategory = (category: MealLogCategory): ChatLogFilterCategory =>
  category === "식비" ? "식비" : "기타소비";
