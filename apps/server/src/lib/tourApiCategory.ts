// TourAPI 신 분류체계(lclsSystm1=FD, 음식) 코드 → 한글 명칭.
// docs/schema-design.md §12: "TourAPI는 분류코드에 대응하는 명칭(FD01→한식,
// FD02→외국식, FD03은 신분류체계 세부명칭, FD04→주점, FD05→카페/찻집)을
// 그대로 저장". FD03(간이음식)만 대분류가 너무 뭉뚱그려져 있어 lclsSystm3
// 세부명칭을 대신 쓴다.
const LCLS_SYSTM_2_LABEL: Record<string, string> = {
  FD01: "한식",
  FD02: "외국식",
  FD04: "주점",
  FD05: "카페/찻집",
};

const LCLS_SYSTM_3_LABEL: Record<string, string> = {
  FD030100: "제과",
  FD030200: "피자/햄버거/샌드위치",
  FD030300: "치킨",
  FD030400: "김밥 분식",
  FD030500: "이동음식",
  FD030600: "기타간이음식",
};

/**
 * @param lclsSystm2 TourAPI 응답의 lclsSystm2 (예: "FD01")
 * @param lclsSystm3 TourAPI 응답의 lclsSystm3 (예: "FD010100")
 */
export const resolveTourApiCategory = (lclsSystm2: string, lclsSystm3: string): string => {
  if (lclsSystm2 === "FD03") {
    return LCLS_SYSTM_3_LABEL[lclsSystm3] ?? "간이음식";
  }
  return LCLS_SYSTM_2_LABEL[lclsSystm2] ?? "기타";
};
