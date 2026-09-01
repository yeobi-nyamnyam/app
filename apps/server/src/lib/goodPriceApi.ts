// 행안부 착한가격업소 API (공공데이터포털 odcloud 표준데이터, uddi:3045247).
// 위치 검색 파라미터가 없어 전량 페이지네이션으로만 수집 가능 (docs/business-logic-notes.md §8).
const GOOD_PRICE_API_URL =
  "https://api.odcloud.kr/api/3045247/v1/uddi:afd3af75-a7d4-403d-b6e0-823c848d935d";

const PAGE_SIZE = 1000;

export interface GoodPriceStore {
  시도: string;
  시군: string;
  업종: string;
  업소명: string;
  연락처: string | null;
  주소: string;
  메뉴1: string | null;
  가격1: string | null;
  메뉴2: string | null;
  가격2: string | null;
  메뉴3: string | null;
  가격3: string | null;
  메뉴4: string | null;
  가격4: string | null;
}

interface GoodPriceApiResponse {
  page: number;
  perPage: number;
  totalCount: number;
  currentCount: number;
  matchCount: number;
  data: GoodPriceStore[];
}

const fetchPage = async (page: number, serviceKey: string): Promise<GoodPriceApiResponse> => {
  const url = new URL(GOOD_PRICE_API_URL);
  url.searchParams.set("page", String(page));
  url.searchParams.set("perPage", String(PAGE_SIZE));
  url.searchParams.set("returnType", "JSON");

  const response = await fetch(url, {
    headers: { Authorization: `Infuser ${serviceKey}` },
  });

  if (!response.ok) {
    throw new Error(`착한가격업소 API 호출 실패 (status: ${response.status})`);
  }

  return (await response.json()) as GoodPriceApiResponse;
};

/**
 * 착한가격업소 전량을 페이지네이션으로 수집한다.
 *
 * @param regionSido 시/도명 목록으로 결과를 제한 (optional). API 자체에는 지역
 * 필터 파라미터가 없어 전량 수집 후 클라이언트 측에서 필터링한다. 비우면 전국.
 */
export const fetchAllGoodPriceStores = async (regionSido?: string[]): Promise<GoodPriceStore[]> => {
  const serviceKey = process.env.GOOD_PRICE_API_KEY;
  if (!serviceKey) {
    throw new Error("Missing GOOD_PRICE_API_KEY env config");
  }

  const stores: GoodPriceStore[] = [];
  let page = 1;
  while (true) {
    const response = await fetchPage(page, serviceKey);
    stores.push(...response.data);
    if (stores.length >= response.totalCount || response.currentCount < PAGE_SIZE) {
      break;
    }
    page += 1;
  }

  if (!regionSido || regionSido.length === 0) {
    return stores;
  }
  const regionSet = new Set(regionSido);
  return stores.filter((store) => regionSet.has(store.시도));
};
