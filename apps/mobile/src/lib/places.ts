export interface PlaceSearchResult {
  name: string;
  address: string;
}

// apps/server의 네이버 지역 검색 프록시 엔드포인트. Override with EXPO_PUBLIC_SERVER_URL for staging/prod.
const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:4000";

// F6-10: 매장명/도로명 주소 텍스트로 장소를 검색한다 (서버가 네이버 지역 검색 API를
// 프록시). 두 검색 모드 모두 같은 엔드포인트를 쓴다 — 이 API가 매장명/주소 텍스트
// 둘 다 매칭해준다.
export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  const url = new URL(`${serverUrl}/record/places/search`);
  url.searchParams.set("query", query);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("장소 검색에 실패했습니다.");
  }

  const data = (await response.json()) as {
    results: { name: string; roadAddress: string; address: string }[];
  };
  return data.results.map((result) => ({
    name: result.name,
    address: result.roadAddress || result.address,
  }));
}
