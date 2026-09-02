export interface RestaurantDetailFromApi {
  businessHours: string | null;
  holiday: string | null;
  phone: string | null;
  menu: string[];
}

// apps/server의 TourAPI 상세(영업시간/휴일) 지연 로딩 프록시 엔드포인트.
const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:4000";

// F3-2: 일반 업소(source=tour_api)는 목록 조회에 영업시간/휴일이 없어 상세
// 화면 진입 시에만 조회한다 (서버가 24시간 캐시 후 TourAPI를 프록시).
export async function fetchRestaurantDetail(restaurantId: string): Promise<RestaurantDetailFromApi> {
  const response = await fetch(`${serverUrl}/recommend/restaurants/${restaurantId}/detail`);
  if (!response.ok) {
    throw new Error("영업시간 정보를 불러오지 못했습니다.");
  }
  return (await response.json()) as RestaurantDetailFromApi;
}
