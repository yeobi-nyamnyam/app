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
  confirmIntent: "yes" | "no" | "unclear" | null;
}

/**
 * @param tripName 오늘 진행 중인 여행 이름 (프롬프트 컨텍스트용)
 * @param todayBudget 오늘 남은 식비 계산에 쓰는 오늘의 식비 예산
 * @param todayConsumed 오늘 지금까지 소비한 금액
 * @param message 사용자가 방금 보낸 메시지
 * @param history 이번 대화 화면에서 지금까지 주고받은 턴 (매번 새 세션이라 과거 세션은 포함 안 함)
 * @param pendingConfirmation 직전에 "이 지출을 기타소비로 기록할지" 확인을 물어본 상태일 때만 전달
 *   (optional). 전달하면 서버가 이번 메시지를 그 예/아니오 답변으로 함께 해석해 confirmIntent를 채워 돌려준다.
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
  pendingConfirmation,
  onToken,
  onDone,
  onError,
}: {
  tripName: string;
  todayBudget: number;
  todayConsumed: number;
  message: string;
  history: ChatHistoryItem[];
  pendingConfirmation?: { amount: number };
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
    body: JSON.stringify({ tripName, todayBudget, todayConsumed, message, history, pendingConfirmation }),
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
    // 비정상 HTTP 응답(401/400/502/500)일 때 event.message는 서버가 내려준 응답 바디
    // 원문(JSON 문자열)이 그대로 들어온다 — { message: "..." } 형태면 그 문구만 꺼내 쓴다.
    const raw = "message" in event ? event.message : null;
    let message = "AI 응답을 받아오지 못했습니다.";
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { message?: unknown };
        message = typeof parsed.message === "string" ? parsed.message : raw;
      } catch {
        message = raw;
      }
    }
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
