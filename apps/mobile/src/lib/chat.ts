import type { MealLogCategory } from "@/components/RecordForm";

export interface ParsedChatExpense {
  amount: number;
  category: MealLogCategory;
}

const CATEGORY_KEYWORDS: { category: MealLogCategory; keywords: string[] }[] = [
  { category: "교통", keywords: ["버스", "택시", "지하철", "기차", "톨게이트", "주유", "교통"] },
  { category: "숙박", keywords: ["숙소", "호텔", "모텔", "게스트하우스", "숙박"] },
  { category: "기념품", keywords: ["기념품", "선물", "쇼핑"] },
  { category: "식비", keywords: ["아침", "점심", "저녁", "밥", "식사", "먹", "간식", "카페", "커피"] },
];

const extractAmount = (text: string): number | null => {
  const manMatch = text.match(/(\d+(?:\.\d+)?)\s*만\s*원?/);
  if (manMatch) return Math.round(Number(manMatch[1] ?? "0") * 10000);

  const cheonMatch = text.match(/(\d+(?:\.\d+)?)\s*천\s*원?/);
  if (cheonMatch) return Math.round(Number(cheonMatch[1] ?? "0") * 1000);

  const wonMatch = text.match(/([\d,]+)\s*원/);
  if (wonMatch) return Number((wonMatch[1] ?? "0").replace(/,/g, ""));

  const bareNumber = text.match(/\d{3,}/);
  if (bareNumber) return Number(bareNumber[0] ?? "0");

  return null;
};

/**
 * @param text 사용자가 채팅에 입력한 자유 텍스트
 * 실제 LLM 연동(C2, provider 미확정)이 붙기 전까지 쓰는 간단한 로컬 키워드 휴리스틱.
 * 금액을 찾지 못하면 null을 반환한다. 카테고리를 찾지 못하면 '기타'로 처리한다.
 */
export const parseChatExpense = (text: string): ParsedChatExpense | null => {
  const amount = extractAmount(text);
  if (amount === null || amount <= 0) return null;

  const matched = CATEGORY_KEYWORDS.find(({ keywords }) =>
    keywords.some((keyword) => text.includes(keyword)),
  );

  return { amount, category: matched?.category ?? "기타" };
};

/**
 * @param date 시각을 표시할 Date 객체
 */
export const formatChatTime = (date: Date): string =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

export interface ChatMockTrip {
  id: string;
  name: string;
}

export type ChatLogFilterCategory = "식비" | "기타소비";

export interface ChatMockLogEntry {
  id: string;
  title: string;
  time: string;
  categoryLabel: string;
  filterCategory: ChatLogFilterCategory;
  price: number;
}

export interface ChatMockLogGroup {
  date: string;
  entries: ChatMockLogEntry[];
}

// TODO(C0 API 연동): 실제 여행/예산/채팅 로그 데이터 연동 전까지 chat 화면 전체가
// 공유하는 목데이터. F1/F2가 화면을 먼저 만들고 나중에 쿼리를 붙인 흐름과 동일하다.
export const MOCK_HAS_ACTIVE_TRIP = true;

export const MOCK_TRIP: ChatMockTrip = {
  id: "00000000-0000-0000-0000-000000000000",
  name: "친구들과 대구 여행",
};

export const MOCK_DAY_BUDGET = 45000;
export const MOCK_CONSUMED = 13000;

export const MOCK_LOG_GROUPS: ChatMockLogGroup[] = [
  {
    date: "08.13 | 2일차",
    entries: [
      { id: "1", title: "미분당", time: "19:20", categoryLabel: "점심", filterCategory: "식비", price: 13000 },
    ],
  },
  {
    date: "08.12 | 1일차",
    entries: [
      { id: "2", title: "돼지국밥", time: "19:20", categoryLabel: "저녁", filterCategory: "식비", price: 18000 },
      { id: "3", title: "돈까스", time: "19:20", categoryLabel: "점심", filterCategory: "식비", price: 15000 },
      {
        id: "4",
        title: "김밥천국 A세트",
        time: "19:20",
        categoryLabel: "아침",
        filterCategory: "식비",
        price: 12000,
      },
    ],
  },
];
