import { Router } from "express";
import { z } from "zod";
import { registry } from "../openapi/registry";
import { fetchTourApiIntro } from "../lib/tourApi";
import { getSupabaseAdmin } from "../lib/supabase";

// 24시간 이내에 이미 지연 로딩한 적 있으면 TourAPI를 다시 호출하지 않고 캐시된 값을 쓴다.
const DETAIL_FRESH_MS = 24 * 60 * 60 * 1000;

const RestaurantDetailParamsSchema = z.object({
  id: z.string().uuid().openapi({ example: "9d1f6a2e-4b3a-4c1e-9d1f-6a2e4b3a4c1e" }),
});

const RestaurantDetailResponseSchema = z.object({
  businessHours: z.string().nullable().openapi({ example: "11:30~20:30" }),
  holiday: z.string().nullable().openapi({ example: "매주 화요일" }),
  phone: z.string().nullable().openapi({ example: "053-814-0640" }),
  menu: z.array(z.string()).openapi({ example: ["정식까스", "육개장", "생선까스"] }),
});

const ErrorResponseSchema = z.object({
  message: z.string().openapi({ example: "음식점을 찾을 수 없습니다." }),
});

registry.registerPath({
  method: "get",
  path: "/recommend/restaurants/{id}/detail",
  tags: ["Recommend"],
  summary: "일반 업소(TourAPI) 영업시간/휴일/메뉴 지연 로딩 (F3-2)",
  description:
    "restaurants.source='tour_api' 업소의 영업시간/휴일/전화/메뉴는 지역기반 목록 조회에는 " +
    "없어 상세 화면 진입 시에만 조회한다. detail_synced_at이 24시간 이내면 캐시된 값을 " +
    "그대로 반환하고, 아니면 TourAPI detailIntro2를 호출해 restaurants를 갱신한 뒤 반환한다. " +
    "메뉴는 firstmenu(대표메뉴)+treatmenu(취급메뉴)를 합친 이름 목록이며 가격 정보는 없다.",
  request: {
    params: RestaurantDetailParamsSchema,
  },
  responses: {
    200: {
      description: "영업시간/휴일/전화/메뉴",
      content: { "application/json": { schema: RestaurantDetailResponseSchema } },
    },
    404: {
      description: "음식점을 찾을 수 없음",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "TourAPI 호출 실패",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

export const recommendRouter = Router();

interface RestaurantRow {
  source: string;
  external_id: string;
  business_hours: { businessHours: string | null; holiday: string | null; menu?: string[] } | null;
  phone: string | null;
  detail_synced_at: string | null;
}

recommendRouter.get("/recommend/restaurants/:id/detail", async (req, res) => {
  const parseResult = RestaurantDetailParamsSchema.safeParse(req.params);
  if (!parseResult.success) {
    const body: z.infer<typeof ErrorResponseSchema> = { message: "id 형식이 올바르지 않습니다." };
    return res.status(400).json(body);
  }
  const { id } = parseResult.data;

  try {
    const supabase = getSupabaseAdmin();
    const { data: restaurant, error: fetchError } = await supabase
      .from("restaurants")
      .select("source, external_id, business_hours, phone, detail_synced_at")
      .eq("id", id)
      .maybeSingle<RestaurantRow>();

    if (fetchError || !restaurant) {
      const body: z.infer<typeof ErrorResponseSchema> = { message: "음식점을 찾을 수 없습니다." };
      return res.status(404).json(body);
    }

    if (restaurant.source !== "tour_api") {
      const body: z.infer<typeof RestaurantDetailResponseSchema> = {
        businessHours: restaurant.business_hours?.businessHours ?? null,
        holiday: restaurant.business_hours?.holiday ?? null,
        phone: restaurant.phone,
        menu: restaurant.business_hours?.menu ?? [],
      };
      return res.json(body);
    }

    const isFresh =
      restaurant.detail_synced_at != null &&
      Date.now() - new Date(restaurant.detail_synced_at).getTime() < DETAIL_FRESH_MS;

    if (isFresh) {
      const body: z.infer<typeof RestaurantDetailResponseSchema> = {
        businessHours: restaurant.business_hours?.businessHours ?? null,
        holiday: restaurant.business_hours?.holiday ?? null,
        phone: restaurant.phone,
        menu: restaurant.business_hours?.menu ?? [],
      };
      return res.json(body);
    }

    const intro = await fetchTourApiIntro(restaurant.external_id);
    await supabase
      .from("restaurants")
      .update({
        business_hours: { businessHours: intro.businessHours, holiday: intro.holiday, menu: intro.menu },
        phone: intro.phone ?? restaurant.phone,
        detail_synced_at: new Date().toISOString(),
      })
      .eq("id", id);

    const body: z.infer<typeof RestaurantDetailResponseSchema> = {
      businessHours: intro.businessHours,
      holiday: intro.holiday,
      phone: intro.phone ?? restaurant.phone,
      menu: intro.menu,
    };
    return res.json(body);
  } catch {
    const body: z.infer<typeof ErrorResponseSchema> = { message: "상세 정보를 불러오지 못했습니다." };
    return res.status(500).json(body);
  }
});
