import { getCharacterLevel, getCharacterStage, getGrowthStage, getPointsForLevel } from "./character";

describe("getCharacterLevel", () => {
  it("고정 구간표(Lv1~7) 경계값에서 정확히 레벨이 바뀐다", () => {
    expect(getCharacterLevel(49)).toBe(1);
    expect(getCharacterLevel(50)).toBe(2);
    expect(getCharacterLevel(899)).toBe(5);
    expect(getCharacterLevel(900)).toBe(6);
    expect(getCharacterLevel(1399)).toBe(6);
  });

  it("Lv7 이후엔 직전 구간에 1.5배씩 곱해가며 레벨을 계산한다", () => {
    // Lv6→Lv7 구간(500)의 1.5배인 750을 더한 지점(2150)이 Lv8 경계
    expect(getCharacterLevel(1400)).toBe(7);
    expect(getCharacterLevel(2149)).toBe(7);
    expect(getCharacterLevel(2150)).toBe(8);
  });

  it("getPointsForLevel이 계산한 임계값을 그대로 넣으면 해당 레벨을 반환한다 (왕복 일관성)", () => {
    expect(getCharacterLevel(getPointsForLevel(9))).toBe(9);
    expect(getCharacterLevel(getPointsForLevel(12))).toBe(12);
  });
});

describe("getPointsForLevel", () => {
  it("Lv1~7은 고정 구간표 값을 그대로 반환한다", () => {
    expect(getPointsForLevel(1)).toBe(0);
    expect(getPointsForLevel(7)).toBe(1400);
  });

  it("Lv8 이후는 직전 구간의 1.5배씩 누적해 계산한다", () => {
    expect(getPointsForLevel(8)).toBe(2150); // 1400 + round(500*1.5)
    expect(getPointsForLevel(9)).toBe(3275); // 2150 + round(750*1.5)
  });
});

describe("getCharacterStage / getGrowthStage", () => {
  it("진화 단계 경계(Lv2→3, Lv4→5, Lv6→7, Lv9→10)에서 정확히 바뀐다", () => {
    expect(getCharacterStage(2)).toBe("새싹");
    expect(getCharacterStage(3)).toBe("여행자");
    expect(getCharacterStage(4)).toBe("여행자");
    expect(getCharacterStage(5)).toBe("배부른 여행자");
    expect(getCharacterStage(6)).toBe("배부른 여행자");
    expect(getCharacterStage(7)).toBe("미식 탐험가");
    expect(getCharacterStage(9)).toBe("미식 탐험가");
    expect(getCharacterStage(10)).toBe("예산 마스터");
  });

  it("아주 높은 레벨도 항상 마지막 단계(예산 마스터, stage 5)로 수렴한다", () => {
    expect(getCharacterStage(999)).toBe("예산 마스터");
    expect(getGrowthStage(999)).toBe(5);
  });
});
