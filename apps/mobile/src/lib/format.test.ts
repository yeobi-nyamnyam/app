import { formatDateWithWeekday, formatTripPeriod, isLocalToday, parseDigits, todayDate } from "./format";

// 이 앱은 사용자가 전부 한국에 있다고 가정하는 로직(KST 자정 기준 "오늘")이라, 실행
// 환경(CI 등)의 기본 타임존과 무관하게 KST로 고정해 검증한다. 단, Node/V8은 프로세스가
// 시작된 뒤 process.env.TZ를 바꿔도 Date 계산에 반영하지 않아서(타임존을 프로세스 시작
// 시점에 캐싱), 여기서 설정하는 건 아무 효과가 없다 — package.json의 test 스크립트에서
// `TZ=Asia/Seoul jest`로 프로세스 시작 전에 미리 넘겨야 실제로 적용된다.

describe("parseDigits", () => {
  it("숫자가 아닌 문자를 제거하고 숫자로 변환한다", () => {
    expect(parseDigits("1,234원")).toBe(1234);
  });

  it("숫자가 하나도 없으면 0을 반환한다", () => {
    expect(parseDigits("원")).toBe(0);
    expect(parseDigits("")).toBe(0);
  });
});

describe("formatTripPeriod", () => {
  it("당일치기(시작일=종료일)면 날짜 하나만 표시한다", () => {
    expect(formatTripPeriod("2026-02-03", "2026-02-03")).toBe("2026.02.03");
  });

  it("기간이 다르면 시작일 전체 + 종료일 월.일 범위로 표시한다", () => {
    expect(formatTripPeriod("2026-04-11", "2026-04-14")).toBe("2026.04.11 - 04.14");
  });
});

describe("todayDate / isLocalToday (KST 자정 경계 회귀 방지)", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("UTC로는 전날이어도 KST 기준으로는 다음날이면 그 날짜를 오늘로 본다", () => {
    // UTC 2026-01-01T15:30:00Z == KST 2026-01-02 00:30 (자정 막 지난 시각)
    jest.useFakeTimers().setSystemTime(new Date("2026-01-01T15:30:00Z"));

    expect(todayDate()).toBe("2026-01-02");
  });

  it("KST 기준 같은 날이면 today로, 전날이면 false로 판단한다", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-01-01T15:30:00Z")); // KST 2026-01-02 00:30

    expect(isLocalToday("2026-01-01T15:00:00Z")).toBe(true); // KST 2026-01-02 00:00 (오늘)
    expect(isLocalToday("2025-12-31T15:00:00Z")).toBe(false); // KST 2026-01-01 00:00 (전날)
  });
});

describe("formatDateWithWeekday", () => {
  it("요일까지 포함해 포맷한다", () => {
    // 2026-01-01은 목요일
    expect(formatDateWithWeekday("2026-01-01T09:00:00+09:00")).toBe("2026.01.01 (목)");
  });
});
