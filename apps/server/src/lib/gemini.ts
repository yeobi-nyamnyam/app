import { GoogleGenerativeAI } from "@google/generative-ai";

// getSupabaseAdmin()과 동일하게 지연 생성한다. GEMINI_API_KEY가 아직 없는 로컬 환경에서
// 이 파일을 import하는 것만으로 서버 전체가 부팅에 실패하지 않게 하기 위함
// (health check 등 이 키가 필요 없는 라우트까지 영향받는 걸 막음).
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing Gemini API key env config (GEMINI_API_KEY)");
  }

  return new GoogleGenerativeAI(apiKey);
}

// 무료 티어 기준 gemini-3.6-flash는 RPD(하루 요청 한도)가 20건뿐이라 QA 중에도
// 금방 소진된다. gemini-3.5-flash-lite는 같은 무료 등급에서 RPD 500으로 훨씬
// 여유롭고, 채팅(C1/C2)의 구조화 출력 파싱 작업엔 이 정도로 충분하다 (이슈 #223).
export const GEMINI_CHAT_MODEL = "gemini-3.5-flash-lite";
