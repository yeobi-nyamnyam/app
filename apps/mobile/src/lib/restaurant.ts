export interface RestaurantMenuItem {
  name: string;
  price: number;
}

const safeJsonParse = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

// restaurants.price_menus는 GraphQL JSON 스칼라(unknown)로 내려온다 — F3-5 배치가
// 저장하는 형태([{name, price}], apps/server/src/scripts/syncGoodPriceRestaurants.ts)를
// 신뢰하고 파싱한다. pg_graphql이 jsonb 컬럼을 이중 인코딩된 JSON 문자열로 내려주므로
// (배열 리터럴이 아니라 "[{...}]" 형태) 먼저 문자열이면 JSON.parse부터 거친다.
export const parsePriceMenus = (raw: unknown): RestaurantMenuItem[] => {
  const parsed = typeof raw === "string" ? safeJsonParse(raw) : raw;
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is RestaurantMenuItem => {
    if (typeof item !== "object" || item === null) return false;
    const record = item as Record<string, unknown>;
    return typeof record.name === "string" && typeof record.price === "number";
  });
};

/**
 * @param menus price_menus를 parsePriceMenus로 파싱한 배열
 */
export const getCheapestMenuPrice = (menus: RestaurantMenuItem[]): number | null =>
  menus.length > 0 ? Math.min(...menus.map((menu) => menu.price)) : null;
