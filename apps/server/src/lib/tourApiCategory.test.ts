import { describe, expect, it } from "vitest";
import { resolveTourApiCategory } from "./tourApiCategory";

describe("resolveTourApiCategory", () => {
  it("FD03이 아니면 lclsSystm2 매핑표를 그대로 사용한다", () => {
    expect(resolveTourApiCategory("FD01", "FD010100")).toBe("한식");
  });

  it("FD03이면 lclsSystm3 세부 코드로 매핑한다", () => {
    expect(resolveTourApiCategory("FD03", "FD030300")).toBe("치킨");
  });

  it("FD03인데 lclsSystm3가 매핑표에 없으면 간이음식으로 대체한다", () => {
    expect(resolveTourApiCategory("FD03", "FD039999")).toBe("간이음식");
  });

  it("lclsSystm2가 매핑표에 없으면 기타로 대체한다", () => {
    expect(resolveTourApiCategory("FD99", "FD990000")).toBe("기타");
  });
});
