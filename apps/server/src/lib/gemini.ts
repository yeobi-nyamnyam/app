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

export const GEMINI_CHAT_MODEL = "gemini-3.6-flash";
