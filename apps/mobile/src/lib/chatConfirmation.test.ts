import { resolvePendingConfirmation, type PendingOtherExpenseSuggestion } from "./chatConfirmation";

const suggestion = (overrides: Partial<PendingOtherExpenseSuggestion> = {}): PendingOtherExpenseSuggestion => ({
  amount: 3000,
  declined: false,
  clarifyAttempts: 0,
  ...overrides,
});

describe("resolvePendingConfirmation", () => {
  it("yes면 declined/clarifyAttempts와 무관하게 항상 기록으로 확정한다", () => {
    expect(resolvePendingConfirmation(suggestion({ declined: true, clarifyAttempts: 2 }), "yes")).toEqual({
      action: "record",
    });
  });

  it("첫 거절(no)은 닫지 않고 번복 기회를 한 번 더 열어둔다", () => {
    const result = resolvePendingConfirmation(suggestion(), "no");

    expect(result).toEqual({
      action: "keepPending",
      suggestion: { amount: 3000, declined: true, clarifyAttempts: 0 },
    });
  });

  it("이미 한 번 거절한 뒤 다시 no면 더 이상 번복 기회를 주지 않고 닫는다", () => {
    const result = resolvePendingConfirmation(suggestion({ declined: true }), "no");

    expect(result).toEqual({ action: "close" });
  });

  it("unclear면 clarifyAttempts를 늘리며 대기 상태를 유지한다", () => {
    const result = resolvePendingConfirmation(suggestion({ clarifyAttempts: 0 }), "unclear");

    expect(result).toEqual({
      action: "keepPending",
      suggestion: { amount: 3000, declined: false, clarifyAttempts: 1 },
    });
  });

  it("unclear가 3번째에 도달하면 더 붙잡지 않고 접는다", () => {
    const result = resolvePendingConfirmation(suggestion({ clarifyAttempts: 2 }), "unclear");

    expect(result).toEqual({ action: "close" });
  });

  it("거절 후(declined) 다시 unclear가 와도 clarifyAttempts는 독립적으로 계속 늘어난다", () => {
    const result = resolvePendingConfirmation(suggestion({ declined: true, clarifyAttempts: 1 }), "unclear");

    expect(result).toEqual({
      action: "keepPending",
      suggestion: { amount: 3000, declined: true, clarifyAttempts: 2 },
    });
  });
});
