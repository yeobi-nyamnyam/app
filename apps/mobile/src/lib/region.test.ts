// region.ts가 최상단에서 apolloClient를 import하는데, 실제 모듈을 그대로 두면
// apollo.ts → supabase.ts → AsyncStorage 네이티브 모듈까지 연쇄로 로드되면서
// 테스트 환경에서 깨진다(순수 함수만 테스트해도 마찬가지). apolloClient를
// 통째로 mock해서 이 import 체인을 끊는다 — lookupRegion 테스트에도 필요한 mock.
jest.mock("@/lib/apollo", () => ({
  apolloClient: { query: jest.fn() },
}));

import { apolloClient } from "@/lib/apollo";
import { lookupRegion, matchRow, parseSigunguEntries, toSigunguLevelName, type RegionCacheRow } from "./region";

const mockQuery = apolloClient.query as jest.Mock;

const mockRegionRows = (rows: { region_code: string; region_name: string; tour_api_snapshot?: unknown }[]) => {
  mockQuery.mockResolvedValue({
    data: { region_cacheCollection: { edges: rows.map((node) => ({ node: { tour_api_snapshot: [], ...node } })) } },
  });
};

describe("toSigunguLevelName", () => {
  it("일반구가 있는 시는 시 이름만 뽑는다", () => {
    expect(toSigunguLevelName("수원시 장안구")).toBe("수원시");
  });

  it("구만 있는 이름(광역시 산하 구 등)은 시/도에 걸쳐 모호해 null을 반환한다", () => {
    expect(toSigunguLevelName("중구")).toBeNull();
  });

  it("구가 없는 일반 시/군 이름은 그대로 반환한다", () => {
    expect(toSigunguLevelName("경주시")).toBe("경주시");
  });
});

describe("matchRow", () => {
  const row: RegionCacheRow = { regionCode: "41", regionName: "경기도", sigunguNames: ["수원시", "성남시"] };

  it("시/도 이름이 정확히 일치하면 매칭한다", () => {
    expect(matchRow(row, "경기도")).toEqual({ regionCode: "41", regionName: "경기도", displayName: "경기도" });
  });

  it("시/도 이름의 접두어여도 매칭한다", () => {
    expect(matchRow(row, "경기")).toEqual({ regionCode: "41", regionName: "경기도", displayName: "경기도" });
  });

  it("시/도가 안 맞으면 시/군 후보명으로 매칭하고, displayName은 시/군 이름을 쓴다", () => {
    expect(matchRow(row, "수원")).toEqual({ regionCode: "41", regionName: "경기도", displayName: "수원시" });
  });

  it("어디에도 안 맞으면 null을 반환한다", () => {
    expect(matchRow(row, "존재안함")).toBeNull();
  });
});

describe("parseSigunguEntries", () => {
  it("배열로 오면 그대로 파싱한다", () => {
    expect(parseSigunguEntries([{ sigungu_code: "1", sigungu_name: "수원시" }])).toEqual([
      { sigungu_code: "1", sigungu_name: "수원시" },
    ]);
  });

  it("pg_graphql이 JSON 문자열로 내려줘도 파싱한다", () => {
    expect(parseSigunguEntries(JSON.stringify([{ sigungu_code: "1", sigungu_name: "수원시" }]))).toEqual([
      { sigungu_code: "1", sigungu_name: "수원시" },
    ]);
  });

  it("깨진 JSON이나 배열이 아닌 값은 빈 배열로 처리한다", () => {
    expect(parseSigunguEntries("이건 JSON이 아님")).toEqual([]);
    expect(parseSigunguEntries(null)).toEqual([]);
    expect(parseSigunguEntries({})).toEqual([]);
  });
});

// lookupRegion 자체는 matchRow/toSigunguLevelName 단독 테스트로는 못 잡는
// "조립" 로직(별칭이 여러 시/도로 펼쳐지는 것, matched/ambiguous/not_found
// 분기)만 최소한으로 확인한다. apolloClient는 mock 데이터로 대체.
describe("lookupRegion", () => {
  afterEach(() => {
    mockQuery.mockReset();
  });

  it("입력이 비어있으면 조회 없이 not_found를 반환한다", async () => {
    const result = await lookupRegion("   ");

    expect(result).toEqual({ status: "not_found" });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("구식 접미사 별칭(서울시→서울)을 정식 명칭으로 바꿔 매칭한다", async () => {
    mockRegionRows([{ region_code: "11", region_name: "서울" }]);

    const result = await lookupRegion("서울시");

    expect(result).toEqual({
      status: "matched",
      region: { regionCode: "11", regionName: "서울", displayName: "서울" },
    });
  });

  it("경상도처럼 시/도가 특정 안 되는 옛 지명은 두 후보 모두로 ambiguous 처리한다", async () => {
    mockRegionRows([
      { region_code: "47", region_name: "경상북도" },
      { region_code: "48", region_name: "경상남도" },
    ]);

    const result = await lookupRegion("경상도");

    expect(result.status).toBe("ambiguous");
    if (result.status === "ambiguous") {
      expect(result.candidates.map((c) => c.regionName).sort()).toEqual(["경상남도", "경상북도"]);
    }
  });

  it("어디에도 매칭 안 되면 not_found를 반환한다", async () => {
    mockRegionRows([{ region_code: "11", region_name: "서울" }]);

    expect(await lookupRegion("존재안함")).toEqual({ status: "not_found" });
  });
});
