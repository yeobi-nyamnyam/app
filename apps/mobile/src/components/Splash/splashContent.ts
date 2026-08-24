import type { CharacterShadow, CharacterVariant, IconName } from '@repo/ui'

// Figma "Splash Screens" 섹션(node 448:2638) 기준 레퍼런스 좌표계 (iPhone 프레임 크기)
export const REFERENCE_WIDTH = 402
export const REFERENCE_HEIGHT = 874

// Figma "text/strong"·"text/default" — packages/tokens의 현재 시맨틱 컬러 세트에
// 아직 없는 값이라 로컬 상수로 둠 (tokens.json에 추가되면 교체)
export const TITLE_TEXT_COLOR = '#1e2327'
export const SUBTITLE_TEXT_COLOR = '#37454e'

export const SUBTITLE_LINES = ['쓴 만큼 다시 계산해서', '남은 식비에 맞는 밥집을 찾아드려요']

export type TipRow = {
  icon: IconName
  title: string
}

export const TIP_ROWS: TipRow[] = [
  { icon: 'bulb', title: '지출 한 줄이면 남은 예산 자동 재계산' },
  { icon: 'link-horizontal', title: '착한가격업소 우선 추천' },
  { icon: 'puzzle', title: "기록할수록 자라나는 캐릭터 '여비'" },
]

export type CharacterLayout = {
  variant: CharacterVariant
  left: number
  top: number
  // 실제 캐릭터 렌더 크기(회전 전). 회전이 없으면 boundingSize와 같음
  size: number
  // 회전된 캐릭터를 감싸는 정사각형 bounding box 크기(Figma export 프레임 크기).
  // 지정하지 않으면 size와 동일(= 회전 없음)
  boundingSize?: number
  // 시계 방향 회전각(deg). Figma "rotate" 값 그대로
  rotation?: number
  shadow?: CharacterShadow
  // 캐릭터 전체를 흐리게 만드는 layer blur 반경. Figma "layer blur" 값 그대로
  blur?: number
}

// draft 1~3: 캐릭터 5종의 배치만 다른 3가지 고정 구성 (splash가 뜰 때 랜덤으로 하나 선택)
export const DRAFTS: CharacterLayout[][] = [
  [
    { variant: 'apricot', left: 0, top: 752, size: 88 },
    { variant: 'aqua', left: 78.5, top: 752, size: 88 },
    { variant: 'sky', left: 157, top: 752, size: 88 },
    { variant: 'slate', left: 235.5, top: 752, size: 88 },
    { variant: 'coral', left: 314, top: 752, size: 88 },
  ],
  [
    { variant: 'apricot', left: 16, top: 752, size: 88 },
    { variant: 'slate', left: 197, top: 601, size: 88 },
    { variant: 'coral', left: 260, top: 664, size: 88 },
    { variant: 'aqua', left: 216, top: 752, size: 88 },
    { variant: 'sky', left: 298, top: 752, size: 88 },
  ],
  // Figma 원본 기준 apricot·"작고 회전된 민트색 캐릭터"는 drop shadow가 아니라 layer blur
  // (전체 실루엣이 흐려짐)만 적용되어 있음. slate는 drop shadow + layer blur 둘 다 적용.
  // (packages/ui의 CHARACTER_COLORS가 aqua/sky 색을 Figma와 반대로 갖고 있어서, 여기서는
  // Figma가 파란색으로 그린 큰 캐릭터를 'sky', 민트색 작은 캐릭터를 'aqua'로 맞춰 지정함)
  [
    {
      variant: 'apricot',
      left: 48.29,
      top: 339.48,
      size: 80,
      boundingSize: 106.31,
      rotation: 25,
      blur: 1.15,
    },
    { variant: 'aqua', left: 249, top: 579.91, size: 64, boundingSize: 72.28, rotation: -8, blur: 2.25 },
    {
      variant: 'sky',
      left: 57,
      top: 615,
      size: 120,
      shadow: { offsetY: 2, blur: 5, opacity: 0.25 },
    },
    {
      variant: 'slate',
      left: 20.81,
      top: 734,
      size: 80,
      boundingSize: 106.31,
      rotation: 25,
      shadow: { offsetY: 2, blur: 5, opacity: 0.2 },
      blur: 1,
    },
    {
      variant: 'coral',
      left: 240,
      top: 694.96,
      size: 150,
      boundingSize: 183.81,
      rotation: -15.05,
      shadow: { offsetY: 4, blur: 3.25, opacity: 0.25 },
    },
  ],
]
