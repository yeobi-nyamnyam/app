import { RegionsDocument } from "@repo/types";

import { apolloClient } from "@/lib/apollo";

export interface RegionMatch {
  regionCode: string;
  regionName: string;
  // 사용자에게 보여줄 이름 — 시/군 단위로 매칭됐으면 그 이름(예: "경주시"),
  // 시/도 단위로 매칭됐으면 regionName과 동일.
  displayName: string;
}

export type RegionLookupResult =
  | { status: "matched"; region: RegionMatch }
  | { status: "ambiguous"; candidates: RegionMatch[] }
  | { status: "not_found" };

interface TourApiSigunguEntry {
  sigungu_code: string;
  sigungu_name: string;
}

interface RegionCacheRow {
  regionCode: string;
  regionName: string;
  // 시/군 단위 검색용 후보명 (구 단위는 제외, 중복 제거됨). see toSigunguLevelName
  sigunguNames: string[];
}

// region_cache는 정식 명칭(예: "광주광역시")으로 시드돼 있지만, 사용자는 "광주"처럼
// 줄여 쓰는 경우가 많다. "충북"/"충남"/"경북"/"경남"/"전남"처럼 정식 명칭의 접두어가
// 아닌 옛 2글자 축약형만 별도 별칭으로 보정하고, 나머지(서울/부산/대구/인천/광주/
// 대전/울산/세종/경기/제주/강원/전북)는 정식 명칭이 그 축약형으로 시작해서 접두어
// 매칭만으로 충분하다.
const REGION_NAME_ALIASES: Record<string, string> = {
  충북: "충청북도",
  충남: "충청남도",
  경북: "경상북도",
  경남: "경상남도",
  전남: "전라남도",
};

function isTourApiSigunguEntry(value: unknown): value is TourApiSigunguEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).sigungu_name === "string"
  );
}

// pg_graphql의 JSON 스칼라(tour_api_snapshot)는 파싱된 배열이 아니라 JSON 텍스트가
// 담긴 문자열로 내려온다. 문자열이면 먼저 JSON.parse로 풀어준다.
function parseSigunguEntries(snapshot: unknown): TourApiSigunguEntry[] {
  const value = typeof snapshot === "string" ? safeJsonParse(snapshot) : snapshot;
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isTourApiSigunguEntry);
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// "수원시 장안구"처럼 일반구가 있는 시는 tour_api_snapshot에 시 단독 항목 없이
// 구 단위로만 존재해서, 앞의 시 이름만 뽑아 시 단위 검색 후보로 쓴다. 시/군 이름
// 없이 구만 있는 경우(서울/부산 등 광역시 산하 "중구"/"남구" 등)는 여러 시/도에
// 이름이 겹쳐 자유텍스트로는 모호하므로 구 단위 검색 자체를 지원하지 않는다.
function toSigunguLevelName(sigunguName: string): string | null {
  const withCityPrefix = sigunguName.match(/^(.+시) .+구$/);
  if (withCityPrefix?.[1]) {
    return withCityPrefix[1];
  }
  if (sigunguName.endsWith("구")) {
    return null;
  }
  return sigunguName;
}

async function getRegionRows(): Promise<RegionCacheRow[]> {
  const { data } = await apolloClient.query({
    query: RegionsDocument,
    fetchPolicy: "cache-first",
  });
  const edges = data?.region_cacheCollection.edges ?? [];

  return edges.map(({ node }) => {
    const sigunguNames = Array.from(
      new Set(
        parseSigunguEntries(node.tour_api_snapshot)
          .map((entry) => toSigunguLevelName(entry.sigungu_name))
          .filter((sigunguName): sigunguName is string => sigunguName !== null),
      ),
    );
    return { regionCode: node.region_code, regionName: node.region_name, sigunguNames };
  });
}

// row가 query에 매칭되면 표시용 이름과 함께 RegionMatch를 돌려준다. 시/도 이름이
// 먼저 매칭되면 그걸 쓰고, 아니면 시/군 후보명 중 첫 매칭을 표시용 이름으로 쓴다.
function matchRow(row: RegionCacheRow, query: string): RegionMatch | null {
  if (row.regionName === query || row.regionName.startsWith(query)) {
    return { regionCode: row.regionCode, regionName: row.regionName, displayName: row.regionName };
  }
  const sigunguMatch = row.sigunguNames.find((sigunguName) => sigunguName.startsWith(query));
  if (sigunguMatch) {
    return { regionCode: row.regionCode, regionName: row.regionName, displayName: sigunguMatch };
  }
  return null;
}

// F1-1: region_cache는 정적 시드 화이트리스트라 매칭 안 되면 API 폴백 없이 에러 처리
// (docs/business-logic-notes.md, docs/api-server-boundaries.md 결정사항)
//
// 시/도 명칭뿐 아니라 시/군 명칭("경주", "가평")까지 입력을 허용하되, region_code는
// 항상 그 시/군이 속한 시/도의 것이다(region_cache 자체는 시/도 단위 유지). 사용자가
// 실제 본 이름은 displayName으로 별도 보존한다. "고성군"(강원/경남), "광주"(광주광역시/
// 경기도 광주시)처럼 여러 시/도에 걸쳐 매칭되면 status: "ambiguous"로 후보를 모두
// 돌려주고 호출부에서 사용자가 고르게 한다.
export async function lookupRegion(name: string): Promise<RegionLookupResult> {
  const query = name.trim();
  if (!query) {
    return { status: "not_found" };
  }
  const aliased = REGION_NAME_ALIASES[query] ?? query;

  const rows = await getRegionRows();
  const matches = rows
    .map((row) => matchRow(row, aliased))
    .filter((match): match is RegionMatch => match !== null);

  const [firstMatch, ...restMatches] = matches;
  if (!firstMatch) {
    return { status: "not_found" };
  }
  if (restMatches.length === 0) {
    return { status: "matched", region: firstMatch };
  }
  return { status: "ambiguous", candidates: matches };
}
