import { RegionsDocument } from "@repo/types";

import { apolloClient } from "@/lib/apollo";

export interface RegionMatch {
  regionCode: string;
  regionName: string;
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

// F1-1: region_cache는 정적 시드 화이트리스트라 매칭 안 되면 API 폴백 없이 에러 처리
// (docs/business-logic-notes.md, docs/api-server-boundaries.md 결정사항)
export async function findRegionByName(name: string): Promise<RegionMatch | null> {
  const query = name.trim();
  if (!query) {
    return null;
  }
  const aliased = REGION_NAME_ALIASES[query] ?? query;

  const { data } = await apolloClient.query({
    query: RegionsDocument,
    fetchPolicy: "cache-first",
  });
  const regions = data?.region_cacheCollection.edges.map((edge) => edge.node) ?? [];

  const matched = regions.find(
    (region) => region.region_name === aliased || region.region_name.startsWith(aliased),
  );
  return matched ? { regionCode: matched.region_code, regionName: matched.region_name } : null;
}
