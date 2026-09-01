const NAVER_LOCAL_SEARCH_URL = "https://naverapihub.apigw.ntruss.com/search/v1/local";

export interface NaverLocalSearchResult {
  name: string;
  address: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
}

// 네이버 지역 검색 API 응답의 title에는 매칭된 키워드에 <b> 태그가 섞여 온다.
const stripHtmlTags = (text: string) => text.replace(/<\/?[^>]+>/g, "");

/**
 * @param query 검색어 (매장명, 주소 등 자유 텍스트)
 * @param display 최대 결과 수 (기본값 5)
 */
export const searchNaverLocal = async (
  query: string,
  display = 5,
): Promise<NaverLocalSearchResult[]> => {
  const url = new URL(NAVER_LOCAL_SEARCH_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("display", String(display));

  const response = await fetch(url, {
    headers: {
      "X-NCP-APIGW-API-KEY-ID": process.env.NAVER_SEARCH_CLIENT_ID ?? "",
      "X-NCP-APIGW-API-KEY": process.env.NAVER_SEARCH_CLIENT_SECRET ?? "",
    },
  });

  if (!response.ok) {
    throw new Error(`네이버 지역 검색 API 호출 실패 (status: ${response.status})`);
  }

  const data = (await response.json()) as {
    items: { title: string; address: string; roadAddress: string; mapx: string; mapy: string }[];
  };

  return data.items.map((item) => ({
    name: stripHtmlTags(item.title),
    address: item.address,
    roadAddress: item.roadAddress,
    longitude: Number(item.mapx) / 10000000,
    latitude: Number(item.mapy) / 10000000,
  }));
};
