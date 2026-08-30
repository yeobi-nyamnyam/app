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
