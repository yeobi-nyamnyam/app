// 한국관광공사 TourAPI(KorService2) 지역기반 관광정보조회.
// contentTypeId=39(음식점)만 대상으로 하고, lDongRegnCd(법정동 시/도 코드)로
// 지역을 필터링한다 — 이 코드는 region_cache.region_code와 동일한 체계라
// 별도 매핑 없이 그대로 재사용할 수 있다.
const TOUR_API_URL = "https://apis.data.go.kr/B551011/KorService2/areaBasedList2";
const RESTAURANT_CONTENT_TYPE_ID = "39";
const PAGE_SIZE = 1000;

export interface TourApiRestaurant {
  contentid: string;
  title: string;
  addr1: string;
  tel: string;
  firstimage: string;
  mapx: string;
  mapy: string;
  lDongRegnCd: string;
  lDongSignguCd: string;
  lclsSystm1: string;
  lclsSystm2: string;
  lclsSystm3: string;
}

interface TourApiResponse {
  response: {
    header: { resultCode: string; resultMsg: string };
    body: {
      items: "" | { item: TourApiRestaurant[] };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

const fetchPage = async (
  regionCode: string,
  page: number,
  serviceKey: string,
): Promise<TourApiResponse> => {
  const url = new URL(TOUR_API_URL);
  url.searchParams.set("serviceKey", serviceKey);
  url.searchParams.set("numOfRows", String(PAGE_SIZE));
  url.searchParams.set("pageNo", String(page));
  url.searchParams.set("MobileOS", "ETC");
  url.searchParams.set("MobileApp", "yeobinyamnyam");
  url.searchParams.set("_type", "json");
  url.searchParams.set("arrange", "A");
  url.searchParams.set("contentTypeId", RESTAURANT_CONTENT_TYPE_ID);
  url.searchParams.set("lDongRegnCd", regionCode);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TourAPI 호출 실패 (status: ${response.status})`);
  }

  const body = (await response.json()) as TourApiResponse;
  if (body.response.header.resultCode !== "0000") {
    throw new Error(`TourAPI 오류: ${body.response.header.resultMsg}`);
  }
  return body;
};

/**
 * 지정한 시/도(lDongRegnCd)의 음식점(contentTypeId=39)을 페이지네이션으로 전량 수집한다.
 *
 * @param regionCode region_cache.region_code와 동일한 시/도 코드 (예: "27" = 대구광역시)
 */
export const fetchTourApiRestaurants = async (regionCode: string): Promise<TourApiRestaurant[]> => {
  const serviceKey = process.env.TOUR_API_KEY;
  if (!serviceKey) {
    throw new Error("Missing TOUR_API_KEY env config");
  }

  const restaurants: TourApiRestaurant[] = [];
  let page = 1;
  let fetchedCount = 0;
  while (true) {
    const body = await fetchPage(regionCode, page, serviceKey);
    const items = body.response.body.items === "" ? [] : body.response.body.items.item;
    fetchedCount += items.length;
    // lclsSystm1이 "FD"(음식)이 아닌 항목은 contentTypeId=39라도 배제한다.
    restaurants.push(...items.filter((item) => item.lclsSystm1 === "FD"));
    if (fetchedCount >= body.response.body.totalCount || items.length < PAGE_SIZE) {
      break;
    }
    page += 1;
  }
  return restaurants;
};
