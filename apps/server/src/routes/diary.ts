import { Router } from "express";
import { z } from "zod";
import { registry } from "../openapi/registry";
import { getSupabaseAdmin } from "../lib/supabase";
import { GEMINI_CHAT_MODEL, getGeminiClient } from "../lib/gemini";

const MealLogSummarySchema = z.object({
  storeName: z.string().nullable().openapi({ example: "남포동 밀면집" }),
  amount: z.number().int().openapi({ example: 7600 }),
  category: z.string().openapi({ example: "식비" }),
  memo: z.string().nullable().openapi({ example: null }),
});

const DiaryDraftRequestSchema = z.object({
  tripName: z.string().openapi({ example: "친구들과 부산 여행" }),
  dayLabel: z.string().openapi({ example: "2일차 | 08.13" }),
  mealLogs: z.array(MealLogSummarySchema),
  tone: z.enum(["shorter", "emotional"]).optional(),
});

const DiaryDraftResponseSchema = z.object({
  content: z.string().openapi({ example: "아침엔 남포동 밀면집에서 시원한 밀면 한 그릇..." }),
});

const ErrorResponseSchema = z.object({
  message: z.string().openapi({ example: "인증 토큰이 필요합니다." }),
});

registry.registerPath({
  method: "post",
  path: "/diary/draft",
  tags: ["Diary"],
  summary: "여행 일기 AI 초안 생성 (D1)",
  description:
    "Authorization: Bearer <access_token> 필요. 클라이언트가 오늘의 소비 기록 요약을 " +
    "보내면 Gemini로 300자 이내 여행 일기 초안을 생성해 반환한다. 서버는 무상태 " +
    "프록시로 DB를 조회하지 않으며, diaries 저장은 클라이언트가 GraphQL로 처리한다. " +
    "tone을 바꿔 재호출하면 '더 짧게'/'감성적으로' 요청을, tone 없이 재호출하면 " +
    "'다시 생성'을 구현할 수 있다.",
  request: {
    body: { content: { "application/json": { schema: DiaryDraftRequestSchema } } },
  },
  responses: {
    200: {
      description: "생성된 일기 초안",
      content: { "application/json": { schema: DiaryDraftResponseSchema } },
    },
    401: {
      description: "인증 토큰이 없거나 유효하지 않음",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    400: {
      description: "요청 형식이 올바르지 않음",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    502: {
      description: "AI 응답을 받아오지 못함",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "AI 서비스를 사용할 수 없음 (GEMINI_API_KEY 미설정 등)",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

export const diaryRouter = Router();

const TONE_INSTRUCTION: Record<"shorter" | "emotional", string> = {
  shorter: "지금보다 더 짧고 간결하게 요약해줘.",
  emotional: "여행의 감정과 분위기를 더 감성적으로 표현해줘.",
};

const buildPrompt = ({
  tripName,
  dayLabel,
  mealLogs,
  tone,
}: {
  tripName: string;
  dayLabel: string;
  mealLogs: z.infer<typeof MealLogSummarySchema>[];
  tone?: "shorter" | "emotional";
}) => {
  const logLines =
    mealLogs.length > 0
      ? mealLogs
          .map((log) => `- ${log.category}: ${log.storeName ?? "매장 정보 없음"}, ${log.amount}원${log.memo ? ` (${log.memo})` : ""}`)
          .join("\n")
      : "- 기록된 소비 내역 없음";

  return [
    `너는 여행 식비 관리 앱 "여비냠냠"의 일기 작성 도우미야.`,
    `사용자는 "${tripName}" 여행 중이고, 오늘은 ${dayLabel}이야.`,
    "아래는 오늘의 소비 기록이야:",
    logLines,
    "이 기록을 바탕으로 오늘 하루를 돌아보는 여행 일기를 1인칭 반말체로 자연스럽게 작성해줘.",
    "소비 내역을 기계적으로 나열하지 말고, 하루 흐름에 자연스럽게 녹여서 써줘.",
    "반드시 300자 이내로 작성하고, 다른 설명이나 따옴표 없이 일기 본문만 출력해.",
    tone ? TONE_INSTRUCTION[tone] : "",
  ]
    .filter(Boolean)
    .join(" ");
};

diaryRouter.post("/diary/draft", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : undefined;
  if (!token) {
    const body: z.infer<typeof ErrorResponseSchema> = { message: "인증 토큰이 필요합니다." };
    return res.status(401).json(body);
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: userData, error: getUserError } = await supabaseAdmin.auth.getUser(token);
  if (getUserError || !userData.user) {
    const body: z.infer<typeof ErrorResponseSchema> = { message: "유효하지 않은 토큰입니다." };
    return res.status(401).json(body);
  }

  const parseResult = DiaryDraftRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    const body: z.infer<typeof ErrorResponseSchema> = { message: "요청 형식이 올바르지 않습니다." };
    return res.status(400).json(body);
  }
  const { tripName, dayLabel, mealLogs, tone } = parseResult.data;

  let model: ReturnType<ReturnType<typeof getGeminiClient>["getGenerativeModel"]>;
  try {
    model = getGeminiClient().getGenerativeModel({ model: GEMINI_CHAT_MODEL });
  } catch (error) {
    console.error("[diary] Gemini 클라이언트 생성 실패", error);
    const body: z.infer<typeof ErrorResponseSchema> = { message: "AI 서비스를 사용할 수 없습니다." };
    return res.status(500).json(body);
  }

  try {
    const result = await model.generateContent(buildPrompt({ tripName, dayLabel, mealLogs, tone }));
    const content = result.response.text().trim();
    const body: z.infer<typeof DiaryDraftResponseSchema> = { content };
    return res.json(body);
  } catch (error) {
    console.error("[diary] Gemini 초안 생성 실패", error);
    const body: z.infer<typeof ErrorResponseSchema> = { message: "AI 응답을 받아오지 못했습니다." };
    return res.status(502).json(body);
  }
});
