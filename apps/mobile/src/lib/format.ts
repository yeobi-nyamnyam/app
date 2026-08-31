/**
 * @param amount 원 단위 금액
 */
export const formatWon = (amount: number): string => `${amount.toLocaleString("ko-KR")}원`;

/**
 * @param text 숫자 입력 필드에서 받은 원본 텍스트
 */
export const parseDigits = (text: string): number => {
  const digitsOnly = text.replace(/[^0-9]/g, "");
  return digitsOnly.length > 0 ? Number(digitsOnly) : 0;
};

/**
 * @param digitsText parseDigits로 정제해 state에 저장해둔 숫자 문자열 (빈 문자열이면 빈 문자열 반환)
 */
export const formatDigitsForDisplay = (digitsText: string): string =>
  digitsText ? Number(digitsText).toLocaleString("ko-KR") : "";

/**
 * @param isoDateTime ISO timestamptz 문자열 (예: meal_logs.created_at)
 */
export const formatDateTime = (isoDateTime: string): string => {
  const date = new Date(isoDateTime);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// 오늘 날짜(YYYY-MM-DD)를 로컬 타임존 기준으로 반환한다. toISOString()은 UTC라
// 한국 시간 새벽(UTC+9 자정~오전 9시)에는 실제와 다른 전날을 가리키는 버그가 있었다.
export const todayDate = (): string => {
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// isoDateTime을 로컬 타임존 기준 YYYY-MM-DD로 변환해 todayDate()와 비교할 수 있게 한다.
export const isLocalToday = (isoDateTime: string): boolean => {
  const date = new Date(isoDateTime);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` === todayDate();
};

/**
 * @param isoDateTime ISO timestamptz 문자열
 */
export const formatTime = (isoDateTime: string): string => {
  const date = new Date(isoDateTime);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const WEEKDAY_LABEL = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * @param isoDateTime ISO timestamptz 문자열 — "YYYY.MM.DD (요일)" 형식(여행 기록 목록의
 * 날짜 구분 헤더)으로 변환
 */
export const formatDateWithWeekday = (isoDateTime: string): string => {
  const date = new Date(isoDateTime);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} (${WEEKDAY_LABEL[date.getDay()]})`;
};
