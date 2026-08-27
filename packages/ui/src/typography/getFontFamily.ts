import { typography } from '@repo/tokens'

// Pretendard는 굵기별로 별도 폰트 파일(Pretendard / Pretendard-SemiBold / Pretendard-Bold)로
// 등록돼 있어서, 네이티브(iOS/Android)에서는 fontWeight 숫자만 바꿔서는 실제로 굵어지지
// 않고 fontFamily 자체를 바꿔야 한다. 이 매핑은 apps/mobile의 루트 _layout.tsx에서
// 등록한 폰트 이름과 반드시 일치해야 한다.
export const getFontFamily = (fontWeight: string): string => {
  if (fontWeight === '700') return 'Pretendard-Bold'
  if (fontWeight === '600') return 'Pretendard-SemiBold'
  return typography.fontFamily
}
