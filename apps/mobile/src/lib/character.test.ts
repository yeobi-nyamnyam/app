import { getCharacterLevel, getCharacterStage, getGrowthStage, getPointsForLevel } from "./character";

// 레벨업에 필요한 포인트 구간표(Lv1~7)와 Lv8+ 배율은 게임 밸런싱 값이라
// 나중에 얼마든지 튜닝될 수 있다. 그래서 특정 포인트 숫자를 하드코딩해
// 검증하지 않고, getPointsForLevel이 계산한 "그 레벨의 임계값"을 기준으로
// getCharacterLevel의 경계 판정이 정확히 그 지점에서 갈리는지만 검증한다.
// 이러면 밸런싱 값이 바뀌어도 이 테스트는 안 고쳐도 된다.
describe("getCharacterLevel", () => {
  it("각 레벨의 임계값(getPointsForLevel)에 도달하는 순간 정확히 그 레벨이 된다", () => {
    for (const level of [2, 3, 5, 6, 7, 8, 9, 12]) {
      const threshold = getPointsForLevel(level);
      expect(getCharacterLevel(threshold)).toBe(level);
      expect(getCharacterLevel(threshold - 1)).toBe(level - 1);
    }
  });

  it("0포인트는 Lv1이다", () => {
    expect(getCharacterLevel(0)).toBe(1);
  });

  it("포인트가 늘어나면 레벨은 절대 줄어들지 않는다", () => {
    let previousLevel = getCharacterLevel(0);
    for (let points = 0; points <= 5000; points += 137) {
      const level = getCharacterLevel(points);
      expect(level).toBeGreaterThanOrEqual(previousLevel);
      previousLevel = level;
    }
  });
});

describe("getPointsForLevel", () => {
  it("레벨이 오를수록 필요 포인트도 항상 늘어난다", () => {
    for (let level = 1; level < 15; level++) {
      expect(getPointsForLevel(level + 1)).toBeGreaterThan(getPointsForLevel(level));
    }
  });
});

// 진화 단계(stage) 경계도 EVOLUTION_STAGES 튜닝값이라 "Lv3=여행자" 같은 라벨을
// 직접 하드코딩하지 않고, "레벨이 오르면 단계는 후퇴하지 않는다" / "아주 높은
// 레벨은 항상 마지막 단계로 수렴한다"는 구조적 규칙만 검증한다.
describe("getCharacterStage / getGrowthStage", () => {
  it("레벨이 오르면 진화 단계는 절대 후퇴하지 않는다", () => {
    let previousStage = getGrowthStage(1);
    for (let level = 1; level <= 30; level++) {
      const stage = getGrowthStage(level);
      expect(stage).toBeGreaterThanOrEqual(previousStage);
      previousStage = stage;
    }
  });

  it("아주 높은 레벨은 항상 마지막 단계로 수렴한다", () => {
    expect(getGrowthStage(9999)).toBe(getGrowthStage(999));
    expect(getCharacterStage(9999)).toBe(getCharacterStage(999));
  });
});
