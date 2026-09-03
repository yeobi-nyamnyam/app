import { fetchWithTimeout } from "./fetchWithTimeout";

// AI 초안 생성은 Gemini 응답을 기다려야 해서 기본 타임아웃보다 여유를 둔다.
const DRAFT_TIMEOUT_MS = 30000;

export interface MealLogSummary {
  storeName: string | null;
  amount: number;
  category: string;
  memo: string | null;
}

const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:4000";

// apps/server의 /diary/draft를 호출한다 (D1). accessToken은 Supabase 세션의
// access_token — 서버가 이 토큰으로 사용자를 인증한다.
export async function generateDiaryDraft(params: {
  accessToken: string;
  tripName: string;
  dayLabel: string;
  mealLogs: MealLogSummary[];
  tone?: "shorter" | "emotional";
}): Promise<string> {
  const response = await fetchWithTimeout(
    `${serverUrl}/diary/draft`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${params.accessToken}`,
      },
      body: JSON.stringify({
        tripName: params.tripName,
        dayLabel: params.dayLabel,
        mealLogs: params.mealLogs,
        tone: params.tone,
      }),
    },
    DRAFT_TIMEOUT_MS,
  );
  if (!response.ok) {
    throw new Error("일기 초안 생성에 실패했어요.");
  }
  const data = (await response.json()) as { content: string };
  return data.content;
}
