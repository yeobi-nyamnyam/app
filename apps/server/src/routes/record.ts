import { Router } from "express";
import { z } from "zod";
import { registry } from "../openapi/registry";

const NAVER_LOCAL_SEARCH_URL = "https://naverapihub.apigw.ntruss.com/search/v1/local";

const PlaceSearchQuerySchema = z.object({
  query: z.string().min(1).openapi({ example: "북구네 돼지국밥" }),
  display: z.coerce.number().int().min(1).max(5).optional().openapi({ example: 5 }),
});

const PlaceResultSchema = z.object({
  name: z.string().openapi({ example: "북구네 돼지국밥" }),
  address: z.string().openapi({ example: "대구광역시 북구 팔달로 135" }),
  roadAddress: z.string().openapi({ example: "대구광역시 북구 팔달로 135 1층" }),
  latitude: z.number().openapi({ example: 35.888 }),
  longitude: z.number().openapi({ example: 128.583 }),
});

const PlaceSearchResponseSchema = z.object({
  results: z.array(PlaceResultSchema),
});

const ErrorResponseSchema = z.object({
  message: z.string().openapi({ example: "장소 검색에 실패했습니다." }),
});

registry.registerPath({
  method: "get",
  path: "/record/places/search",
  tags: ["Record"],
  summary: "매장/장소 검색 (F6-10, 네이버 지역 검색 API 경유)",
  description:
    "매장명 또는 도로명 주소 텍스트로 장소를 검색한다. 네이버 지역 검색 API를 그대로 " +
    "릴레이하며, 결과의 좌표(WGS84)는 meal_logs.store_latitude/longitude에 채우는 데 쓴다.",
  request: {
    query: PlaceSearchQuerySchema,
  },
  responses: {
    200: {
      description: "검색 결과",
      content: { "application/json": { schema: PlaceSearchResponseSchema } },
    },
    500: {
      description: "네이버 API 호출 실패",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

export const recordRouter = Router();

// 네이버 지역 검색 API 응답의 title에는 매칭된 키워드에 <b> 태그가 섞여 온다.
const stripHtmlTags = (text: string) => text.replace(/<\/?[^>]+>/g, "");

recordRouter.get("/record/places/search", async (req, res) => {
  const parseResult = PlaceSearchQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    const body: z.infer<typeof ErrorResponseSchema> = { message: "query 파라미터가 필요합니다." };
    return res.status(400).json(body);
  }
  const { query, display } = parseResult.data;

  try {
    const url = new URL(NAVER_LOCAL_SEARCH_URL);
    url.searchParams.set("query", query);
    url.searchParams.set("display", String(display ?? 5));

    const naverResponse = await fetch(url, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": process.env.NAVER_SEARCH_CLIENT_ID ?? "",
        "X-NCP-APIGW-API-KEY": process.env.NAVER_SEARCH_CLIENT_SECRET ?? "",
      },
    });

    if (!naverResponse.ok) {
      const body: z.infer<typeof ErrorResponseSchema> = { message: "장소 검색에 실패했습니다." };
      return res.status(500).json(body);
    }

    const data = (await naverResponse.json()) as {
      items: { title: string; address: string; roadAddress: string; mapx: string; mapy: string }[];
    };

    const body: z.infer<typeof PlaceSearchResponseSchema> = {
      results: data.items.map((item) => ({
        name: stripHtmlTags(item.title),
        address: item.address,
        roadAddress: item.roadAddress,
        longitude: Number(item.mapx) / 10000000,
        latitude: Number(item.mapy) / 10000000,
      })),
    };
    return res.json(body);
  } catch {
    const body: z.infer<typeof ErrorResponseSchema> = { message: "장소 검색에 실패했습니다." };
    return res.status(500).json(body);
  }
});
