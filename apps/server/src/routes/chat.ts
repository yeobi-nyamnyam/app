import { Router } from "express";
import { z } from "zod";
import { SchemaType } from "@google/generative-ai";
import { registry } from "../openapi/registry";
import { getSupabaseAdmin } from "../lib/supabase";
import { GEMINI_CHAT_MODEL, getGeminiClient } from "../lib/gemini";

const EXPENSE_CATEGORIES = ["식비", "교통", "숙박", "기념품", "기타"] as const;
const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;

const ChatHistoryItemSchema = z.object({
  role: z.enum(["user", "ai"]),
  text: z.string(),
});

const ChatRequestSchema = z.object({
  tripName: z.string().openapi({ example: "친구들과 대구 여행" }),
  todayBudget: z.number().int().openapi({ example: 45000 }),
  todayConsumed: z.number().int().openapi({ example: 13000 }),
  message: z.string().min(1).openapi({ example: "저녁으로 13000원 썼어" }),
  history: z.array(ChatHistoryItemSchema).optional(),
});

const ChatParsedResultSchema = z.object({
  reply: z.string(),
  hasExpense: z.boolean(),
  amount: z.number().int().nullable(),
  category: z.enum(EXPENSE_CATEGORIES).nullable(),
  mealType: z.enum(MEAL_TYPES).nullable(),
});

const ErrorResponseSchema = z.object({
  message: z.string().openapi({ example: "인증 토큰이 필요합니다." }),
});

registry.registerPath({
  method: "post",
  path: "/chat",
  tags: ["Chat"],
  summary: "AI 채팅 응답 + 자연어 소비 파싱 (C1, C2)",
  description:
    "Authorization: Bearer <access_token> 필요. Google Gemini를 호출해 자연어 응답과 " +
    "소비 파싱 결과를 함께 생성한 뒤, text/event-stream(SSE)으로 릴레이한다. " +
    "`event: token`(data: 응답 텍스트 조각)이 여러 번 온 뒤, 마지막에 " +
    "`event: done`(data: ChatParsedResult JSON 전체)이 한 번 온다. " +
    "chat_messages/meal_logs 기록은 서버가 하지 않고 클라이언트가 GraphQL로 처리한다.",
  request: {
    body: {
      content: { "application/json": { schema: ChatRequestSchema } },
    },
  },
  responses: {
    401: {
      description: "인증 토큰이 없거나 유효하지 않음",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    400: {
      description: "요청 형식이 올바르지 않음",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    502: {
      description: "AI 응답을 받아오지 못했거나 검증에 실패함",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "AI 채팅 서비스를 사용할 수 없음 (GEMINI_API_KEY 미설정 등)",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

export const chatRouter = Router();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const buildSystemInstruction = ({
  tripName,
  todayBudget,
  todayConsumed,
}: {
  tripName: string;
  todayBudget: number;
  todayConsumed: number;
}) =>
  [
    `너는 여행 식비 관리 앱 "여비냠냠"의 채팅 비서야. 사용자는 지금 "${tripName}" 여행 중이고,`,
    `오늘 식비 예산은 ${todayBudget}원, 지금까지 ${todayConsumed}원을 썼어.`,
    "사용자가 얼마를 썼는지 자유롭게 말하면 금액과 카테고리를 파악하고, 그렇지 않으면 자연스럽게 대화해줘.",
    `카테고리는 반드시 다음 중 하나만 써: ${EXPENSE_CATEGORIES.join(", ")}.`,
    "카테고리가 식비이고, 메시지에 '아침'/'점심'/'저녁'이거나 그와 명백히 같은 뜻의 단어(예: 브런치→점심,",
    "저녁밥→저녁)가 있으면 mealType을 breakfast/lunch/dinner 중 하나로 채워. '밥', '식사', '먹다'처럼",
    "구체적인 끼니가 특정되지 않으면 mealType은 반드시 null로 둬 — 짐작해서 채우지 마.",
    "카테고리가 식비가 아니면 mealType은 항상 null이야.",
    "금액이 드러난 지출 이야기가 아니면 hasExpense는 false, amount/category/mealType은 null로 응답해.",
    "금액은 있는데 정확히 파악이 안 되면 hasExpense는 false로 두고 reply에서 다시 물어봐.",
    "너는 금액/카테고리를 파악만 할 뿐 실제로 저장하지 않아 — 저장은 앱이 사용자 확인을 거쳐 별도로 처리해.",
    "그러니 hasExpense가 true여도 reply에서 '입력해 드릴게요', '기록해 두었습니다', '저장했어요'처럼",
    "네가 직접 저장/기록했다는 표현은 절대 쓰지 마. 사용자가 말한 내용을 자연스럽게 되짚어주는 정도로만 답해.",
    "reply는 한국어 존댓말로, 짧고 친근하게 1~2문장으로 작성해.",
    "반드시 { reply, hasExpense, amount, category, mealType } 형태의 JSON으로만 응답해.",
  ].join(" ");

chatRouter.post("/chat", async (req, res) => {
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

  const parseResult = ChatRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    const body: z.infer<typeof ErrorResponseSchema> = { message: "요청 형식이 올바르지 않습니다." };
    return res.status(400).json(body);
  }
  const { tripName, todayBudget, todayConsumed, message, history } = parseResult.data;

  let model: ReturnType<ReturnType<typeof getGeminiClient>["getGenerativeModel"]>;
  try {
    model = getGeminiClient().getGenerativeModel({
      model: GEMINI_CHAT_MODEL,
      systemInstruction: buildSystemInstruction({ tripName, todayBudget, todayConsumed }),
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            reply: { type: SchemaType.STRING },
            hasExpense: { type: SchemaType.BOOLEAN },
            amount: { type: SchemaType.INTEGER, nullable: true },
            category: { type: SchemaType.STRING, format: "enum", enum: [...EXPENSE_CATEGORIES], nullable: true },
            mealType: { type: SchemaType.STRING, format: "enum", enum: [...MEAL_TYPES], nullable: true },
          },
          required: ["reply", "hasExpense"],
        },
      },
    });
  } catch (error) {
    console.error("[chat] Gemini 모델 생성 실패", error);
    const body: z.infer<typeof ErrorResponseSchema> = { message: "AI 채팅 서비스를 사용할 수 없습니다." };
    return res.status(500).json(body);
  }

  const contents = [
    ...(history ?? []).map((item) => ({
      role: item.role === "ai" ? "model" : "user",
      parts: [{ text: item.text }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  let rawText: string;
  try {
    const result = await model.generateContent({ contents });
    rawText = result.response.text();
  } catch (error) {
    // Gemini 호출 실패 원인(레이트리밋 429, 타임아웃 등)을 서버 로그에서 구분할 수 있도록 남긴다.
    console.error("[chat] Gemini generateContent 실패", error);
    const body: z.infer<typeof ErrorResponseSchema> = { message: "AI 응답을 받아오지 못했습니다." };
    return res.status(502).json(body);
  }

  let rawJson: unknown;
  try {
    rawJson = JSON.parse(rawText);
  } catch (error) {
    console.error("[chat] Gemini 응답 JSON 파싱 실패", error, rawText);
    const body: z.infer<typeof ErrorResponseSchema> = { message: "AI 응답 형식이 올바르지 않습니다." };
    return res.status(502).json(body);
  }

  const validated = ChatParsedResultSchema.safeParse(rawJson);
  if (!validated.success) {
    console.error("[chat] Gemini 응답 스키마 검증 실패", validated.error, rawJson);
    const body: z.infer<typeof ErrorResponseSchema> = { message: "AI 응답 검증에 실패했습니다." };
    return res.status(502).json(body);
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // 소비로 파싱되면(끼니든 아니든) 클라이언트가 reply 대신 CTA 카드/기록 시트를
  // 바로 보여주고 reply 텍스트는 화면에 노출하지 않는다 — 그럴 때는 굳이 스트리밍
  // 하지 않고 바로 done을 보낸다. 일반 대화/재질문일 때만 타이핑 효과를 낸다.
  const willShowStructuredUi =
    validated.data.hasExpense && validated.data.category != null && validated.data.amount != null;

  if (!willShowStructuredUi) {
    // Gemini의 JSON 구조화 출력은 토큰 스트리밍과 상충해 완성된 응답을 한 번에 받는다.
    // 지연시간 체감을 줄이려는 "SSE 스트리밍 릴레이" 결정을 지키기 위해, 완성된 reply를
    // 단어 단위로 짧게 끊어 흘려보내 타이핑 효과를 낸다.
    for (const word of validated.data.reply.split(" ")) {
      res.write(`event: token\ndata: ${JSON.stringify(`${word} `)}\n\n`);
      await sleep(30);
    }
  }
  res.write(`event: done\ndata: ${JSON.stringify(validated.data)}\n\n`);
  res.end();
});
