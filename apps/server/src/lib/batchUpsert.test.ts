import { describe, expect, it } from "vitest";
import { chunk } from "./batchUpsert";

describe("chunk", () => {
  it("배열을 지정한 크기 단위로 나눈다", () => {
    expect(chunk([1, 2, 3, 4, 5, 6], 2)).toEqual([[1, 2], [3, 4], [5, 6]]);
  });

  it("나누어떨어지지 않으면 마지막 청크는 남은 만큼만 담는다", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("빈 배열은 빈 배열을 반환한다", () => {
    expect(chunk([], 3)).toEqual([]);
  });

  it("size가 배열 길이보다 크면 청크 하나에 전부 담는다", () => {
    expect(chunk([1, 2], 10)).toEqual([[1, 2]]);
  });
});
