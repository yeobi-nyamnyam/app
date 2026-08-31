import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { registry } from "../openapi/registry";

const ReceiptOcrRequestSchema = z.object({
  imageUrl: z.string().url().openapi({
    example: "https://xxxx.supabase.co/storage/v1/object/sign/receipts/...",
  }),
});

const ReceiptOcrResponseSchema = z.object({
  recognized: z.boolean().openapi({ example: false }),
  storeName: z.string().nullable().openapi({ example: "고덕비즈밸리점" }),
  storeAddress: z.string().nullable().openapi({ example: "서울특별시 강동구 고덕비즈밸리로2가길 21" }),
  amount: z.number().int().nullable().openapi({ example: 31800 }),
  bizNumRecognized: z.boolean().openapi({ example: false }),
  raw: z.unknown(),
});

const ErrorResponseSchema = z.object({
  message: z.string().openapi({ example: "영수증 인식에 실패했습니다." }),
});

registry.registerPath({
  method: "post",
  path: "/record/ocr/receipt",
  tags: ["Record"],
  summary: "영수증 이미지 OCR (F6-2/F6-3, 클로바 OCR 커스텀 템플릿 경유)",
  description:
    "클라이언트가 Storage에 업로드한 영수증 이미지의 signed URL을 받아 클로바 OCR " +
    "커스텀 템플릿으로 상호명/주소/결제금액을 인식한다. 템플릿 매칭에 실패하거나 " +
    "일부 필드만 인식된 경우 recognized: false와 함께 인식된 필드만 채워서 반환한다 " +
    "(F6-3 수정 화면에서 나머지를 수동 입력).",
  request: {
    body: { content: { "application/json": { schema: ReceiptOcrRequestSchema } } },
  },
  responses: {
    200: {
      description: "인식 결과 (부분 인식 포함)",
      content: { "application/json": { schema: ReceiptOcrResponseSchema } },
    },
    500: {
      description: "OCR 호출 실패",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

export const ocrRouter = Router();

interface ClovaField {
  name?: string;
  inferText?: string;
}

interface ClovaImageResult {
  inferResult?: string;
  fields?: ClovaField[];
}

interface ClovaOcrResponse {
  images?: ClovaImageResult[];
}

// 결제금액 텍스트에서 콤마/원 등을 떼고 숫자만 남긴다.
const parseAmount = (text: string | undefined): number | null => {
  if (!text) return null;
  const digits = text.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : null;
};

ocrRouter.post("/record/ocr/receipt", async (req, res) => {
  const parseResult = ReceiptOcrRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    const body: z.infer<typeof ErrorResponseSchema> = { message: "imageUrl이 필요합니다." };
    return res.status(400).json(body);
  }
  const { imageUrl } = parseResult.data;

  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      const body: z.infer<typeof ErrorResponseSchema> = { message: "영수증 이미지를 불러오지 못했습니다." };
      return res.status(500).json(body);
    }
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    const clovaResponse = await fetch(process.env.CLOVA_OCR_INVOKE_URL ?? "", {
      method: "POST",
      headers: {
        "X-OCR-SECRET": process.env.CLOVA_OCR_SECRET_KEY ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "V2",
        requestId: randomUUID(),
        timestamp: Date.now(),
        images: [{ format: "jpg", name: "receipt", data: imageBuffer.toString("base64") }],
      }),
    });

    if (!clovaResponse.ok) {
      const body: z.infer<typeof ErrorResponseSchema> = { message: "영수증 인식에 실패했습니다." };
      return res.status(500).json(body);
    }

    const data = (await clovaResponse.json()) as ClovaOcrResponse;
    const image = data.images?.[0];
    const fields = image?.fields ?? [];
    const fieldMap = new Map(fields.map((field) => [field.name, field.inferText]));

    const storeName = fieldMap.get("store_name") ?? null;
    const storeAddress = fieldMap.get("store_address") ?? null;
    const amount = parseAmount(fieldMap.get("total_amount"));
    const bizNumRecognized = Boolean(fieldMap.get("biz_num"));

    const recognized =
      image?.inferResult === "SUCCESS" && Boolean(storeName) && amount !== null && bizNumRecognized;

    const body: z.infer<typeof ReceiptOcrResponseSchema> = {
      recognized,
      storeName,
      storeAddress,
      amount,
      bizNumRecognized,
      raw: data,
    };
    return res.json(body);
  } catch {
    const body: z.infer<typeof ErrorResponseSchema> = { message: "영수증 인식에 실패했습니다." };
    return res.status(500).json(body);
  }
});
