import { describe, expect, it } from "vitest";
import { ChatParsedResultSchema } from "./chat";

describe("ChatParsedResultSchema", () => {
  it("amount/category/mealType이 명시적으로 null이면 통과한다", () => {
    const result = ChatParsedResultSchema.safeParse({
      reply: "무슨 얘기든 해주세요!",
      hasExpense: false,
      amount: null,
      category: null,
      mealType: null,
      confirmIntent: null,
    });
    expect(result.success).toBe(true);
  });

  it("amount/category/mealType 필드 자체가 생략돼도 통과하고 null로 채워진다 (#222)", () => {
    const result = ChatParsedResultSchema.safeParse({
      reply: "무슨 얘기든 해주세요!",
      hasExpense: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBeNull();
      expect(result.data.category).toBeNull();
      expect(result.data.mealType).toBeNull();
    }
  });

  it("hasExpense가 true이고 값이 채워져 있으면 그대로 통과한다", () => {
    const result = ChatParsedResultSchema.safeParse({
      reply: "5,000원 쓰셨네요!",
      hasExpense: true,
      amount: 5000,
      category: "기타",
      mealType: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(5000);
      expect(result.data.category).toBe("기타");
    }
  });
});
