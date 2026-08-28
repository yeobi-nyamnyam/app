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
