import { describe, expect, it } from "vitest";
import { parseAmount } from "./ocr";

describe("parseAmount", () => {
  it("콤마/단위 문자를 떼고 숫자만 남긴다", () => {
    expect(parseAmount("31,800원")).toBe(31800);
  });

  it("숫자 문자열 '0'은 0으로 반환한다 (falsy 문자열 함정 주의)", () => {
    expect(parseAmount("0원")).toBe(0);
  });

  it("숫자가 하나도 없으면 null을 반환한다", () => {
    expect(parseAmount("원")).toBeNull();
  });

  it("입력이 없으면 null을 반환한다", () => {
    expect(parseAmount(undefined)).toBeNull();
  });
});
