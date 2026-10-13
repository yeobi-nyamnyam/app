import { calculateDistanceKm, formatDistanceKm } from "./distance";

describe("calculateDistanceKm", () => {
  it("같은 좌표면 거리가 0이다", () => {
    const point = { latitude: 37.5665, longitude: 126.978 };
    expect(calculateDistanceKm(point, point)).toBe(0);
  });

  it("위도 1도 차이는 약 111.2km다 (적도 기준 1도 ≈ 111.19km)", () => {
    const from = { latitude: 0, longitude: 0 };
    const to = { latitude: 1, longitude: 0 };
    expect(calculateDistanceKm(from, to)).toBeCloseTo(111.19, 1);
  });

  it("서울시청 ↔ 부산시청 실측 거리(약 325km)와 1km 이내로 일치한다", () => {
    const seoulCityHall = { latitude: 37.5665, longitude: 126.978 };
    const busanCityHall = { latitude: 35.1796, longitude: 129.0756 };
    expect(calculateDistanceKm(seoulCityHall, busanCityHall)).toBeCloseTo(325, 0);
  });

  it("순서를 바꿔도 거리는 같다 (대칭)", () => {
    const a = { latitude: 37.5665, longitude: 126.978 };
    const b = { latitude: 35.1796, longitude: 129.0756 };
    expect(calculateDistanceKm(a, b)).toBeCloseTo(calculateDistanceKm(b, a), 10);
  });
});

describe("formatDistanceKm", () => {
  it("소수점 첫째 자리까지 표시하고 km 단위를 붙인다", () => {
    expect(formatDistanceKm(0.52)).toBe("0.5km");
    expect(formatDistanceKm(12.34)).toBe("12.3km");
    expect(formatDistanceKm(0)).toBe("0.0km");
  });
});
