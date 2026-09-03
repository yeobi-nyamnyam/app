export interface PlaceSearchResult {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

// apps/server의 네이버 지역 검색 프록시 엔드포인트. Override with EXPO_PUBLIC_SERVER_URL for staging/prod.
const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:4000";

// F6-10: 매장명/도로명 주소 텍스트로 장소를 검색한다 (서버가 네이버 지역 검색 API를
// 프록시). 두 검색 모드 모두 같은 엔드포인트를 쓴다 — 이 API가 매장명/주소 텍스트
// 둘 다 매칭해준다.
export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  // React Native(Hermes)의 URL/URLSearchParams가 유니코드(한글) 쿼리 파라미터를
  // 안정적으로 인코딩하지 못해 직접 문자열로 만든다.
  //
  // 타이핑마다 300ms 디바운스로 재호출되는 라이브 검색이라 타임아웃을 일부러 안 둔다
  // (fetchWithTimeout 미사용) — 응답이 느려도 다음 타이핑이 새 요청으로 자연히
  // 대체하므로, 중간에 타임아웃 에러 문구가 깜빡이는 것보다 조용히 기다리는 편이 낫다는
  // 사용자 피드백 반영.
  const response = await fetch(
    `${serverUrl}/record/places/search?query=${encodeURIComponent(query)}`,
  );
  if (!response.ok) {
    throw new Error("장소 검색에 실패했습니다.");
  }

  const data = (await response.json()) as {
    results: {
      name: string;
      roadAddress: string;
      address: string;
      latitude: number;
      longitude: number;
    }[];
  };
  return data.results.map((result) => ({
    name: result.name,
    address: result.roadAddress || result.address,
    latitude: result.latitude,
    longitude: result.longitude,
  }));
}
