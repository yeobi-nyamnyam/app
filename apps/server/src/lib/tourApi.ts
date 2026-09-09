// 한국관광공사 TourAPI(KorService2) 지역기반 관광정보조회.
// contentTypeId=39(음식점)만 대상으로 하고, lDongRegnCd(법정동 시/도 코드)로
// 지역을 필터링한다 — 이 코드는 region_cache.region_code와 동일한 체계라
// 별도 매핑 없이 그대로 재사용할 수 있다.
const TOUR_API_URL = "https://apis.data.go.kr/B551011/KorService2/areaBasedList2";
const TOUR_API_DETAIL_INTRO_URL = "https://apis.data.go.kr/B551011/KorService2/detailIntro2";
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

interface TourApiIntroItem {
  opentimefood?: string;
  restdatefood?: string;
  infocenterfood?: string;
  firstmenu?: string;
  treatmenu?: string;
}

interface TourApiIntroResponse {
  response: {
    header: { resultCode: string; resultMsg: string };
    body: {
      items: "" | { item: TourApiIntroItem[] };
    };
  };
}

export interface TourApiIntro {
  businessHours: string | null;
  holiday: string | null;
  phone: string | null;
  /** 착한가격업소(price_menus)와 달리 가격 정보 없이 메뉴명만 제공됨 */
  menu: string[];
}

// TourAPI 텍스트 필드는 줄바꿈을 <br> HTML 태그로 넣어서 준다 — 실제 개행
// 문자로 바꾸고, 남은 태그는 방어적으로 제거한다.
const cleanTourApiText = (raw: string): string =>
  raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();

// firstmenu(대표메뉴 1개)와 treatmenu(취급메뉴, "/"로 구분된 목록)를 합쳐
// 메뉴명 목록으로 만든다. 중복은 제거.
const parseTourApiMenu = (firstmenu?: string, treatmenu?: string): string[] => {
  const names = [...(firstmenu ? [firstmenu] : []), ...(treatmenu ? treatmenu.split("/") : [])]
    .map((name) => cleanTourApiText(name))
    .filter((name) => name.length > 0);
  return Array.from(new Set(names));
};

/**
 * F3-2 지연 로딩: 목록 조회(areaBasedList2)에는 영업시간/휴일이 없어, 상세
 * 화면 진입 시에만 별도 호출한다 (docs/business-logic-notes.md §8).
 *
 * @param contentId restaurants.external_id (TourAPI content_id)
 */
export const fetchTourApiIntro = async (contentId: string): Promise<TourApiIntro> => {
  const serviceKey = process.env.TOUR_API_KEY;
  if (!serviceKey) {
    throw new Error("Missing TOUR_API_KEY env config");
  }

  const url = new URL(TOUR_API_DETAIL_INTRO_URL);
  url.searchParams.set("serviceKey", serviceKey);
  url.searchParams.set("MobileOS", "ETC");
  url.searchParams.set("MobileApp", "yeobinyamnyam");
  url.searchParams.set("_type", "json");
  url.searchParams.set("contentId", contentId);
  url.searchParams.set("contentTypeId", RESTAURANT_CONTENT_TYPE_ID);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TourAPI 상세 호출 실패 (status: ${response.status})`);
  }

  const body = (await response.json()) as TourApiIntroResponse;
  if (body.response.header.resultCode !== "0000") {
    throw new Error(`TourAPI 오류: ${body.response.header.resultMsg}`);
  }

  const item = body.response.body.items === "" ? undefined : body.response.body.items.item[0];
  return {
    businessHours: item?.opentimefood ? cleanTourApiText(item.opentimefood) : null,
    holiday: item?.restdatefood ? cleanTourApiText(item.restdatefood) : null,
    phone: item?.infocenterfood ? cleanTourApiText(item.infocenterfood) : null,
    menu: parseTourApiMenu(item?.firstmenu, item?.treatmenu),
  };
};
