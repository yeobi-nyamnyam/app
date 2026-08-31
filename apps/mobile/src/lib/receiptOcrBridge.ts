export interface ReceiptOcrFillResult {
  storeName: string;
  amount: number;
  receiptImageUrl: string | null;
  ocrRaw: unknown;
}

// expo-router에는 화면이 이전 화면에 값을 반환하는 공식 API가 없어서, 폼
// (record/new → RecordForm)이 OCR 리뷰 화면으로 넘어가기 전에 콜백을 등록해두고,
// 리뷰 화면이 "확인"을 누르면 이 콜백을 호출해 값을 되돌려주는 방식을 쓴다.
let resolver: ((result: ReceiptOcrFillResult) => void) | null = null;

export const setReceiptOcrResolver = (callback: (result: ReceiptOcrFillResult) => void) => {
  resolver = callback;
};

export const resolveReceiptOcr = (result: ReceiptOcrFillResult) => {
  resolver?.(result);
  resolver = null;
};
