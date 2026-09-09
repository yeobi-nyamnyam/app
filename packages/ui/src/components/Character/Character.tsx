import type { ReactNode } from 'react'
import Svg, { G, Path } from 'react-native-svg'
import {
  CHARACTER_BASE_SIZE,
  CHARACTER_COLORS,
  CHARACTER_FACE_FILLS,
  CHARACTER_FACE_PATHS,
  CHARACTER_MOUTH_PATH,
  CHARACTER_SHAPE_PATH,
  type CharacterVariant,
} from './characters'

export type { CharacterVariant }

/**
 * @param offsetY 그림자 y축 오프셋(px, size=88 기준). Figma "drop shadow" 이펙트의 offset Y 값
 * @param blur 그림자 blur 반경(px, size=88 기준). Figma "drop shadow" 이펙트의 blur 값
 * @param opacity 그림자 불투명도(0~1). Figma "drop shadow" 이펙트의 opacity 값
 */
export interface CharacterShadow {
  offsetY: number
  blur: number
  opacity: number
}

/**
 * @param variant 캐릭터 종류: 'apricot' | 'aqua' | 'sky' | 'slate' | 'coral'
 * @param size 한 변의 픽셀 크기 (optional, 기본값 88)
 * @param shadow 캐릭터 실루엣을 따라가는 drop shadow (optional, 기본값 없음 — Figma에 그림자가
 *   있는 variant에만 지정)
 * @param blur 캐릭터 전체(테두리 포함)를 흐릿하게 만드는 layer blur 반경(px, size=88 기준)
 *   (optional, 기본값 없음 — Figma "layer blur" 이펙트가 있는 variant에만 지정)
 */
export interface CharacterProps {
  variant: CharacterVariant
  size?: number
  shadow?: CharacterShadow
  blur?: number
}

const CENTER = CHARACTER_BASE_SIZE / 2

// react-native-svg는 native(iOS/Android)에서 feGaussianBlur 등 filter primitive를 지원하지
// 않아서(Defs/Filter까지만 있고 런타임에서 "not yet supported" 경고를 내며 무시함), 실제
// 캐릭터 실루엣을 조금씩 키운 반투명 레이어를 여러 장 겹쳐 흐림을 흉내냄. 겹칠수록 진해지는
// 알파 합성 특성 덕분에 가장자리는 진하고 바깥으로 갈수록 옅어지는 자연스러운 그라데이션이 나옴
const SHADOW_LAYERS = 8

// 캐릭터 전체를 흐리게 만들 때(layer blur)는, 중심 기준 원형으로 살짝씩 어긋난 사본을
// N장 그려서 평균낸 것처럼 보이게 함. "위에서 아래로 그릴 때 k번째 레이어의 opacity를
// 1/k로 주면 최종 결과가 N장의 단순 평균과 정확히 같아진다"는 알파 합성 성질을 이용
// (오프셋과 opacity 자체는 임의 순서로 둬도 무방 — 각 레이어를 "몇 번째로 그리는지"만 중요)
const BLUR_SAMPLE_COUNT = 9

const Body = ({ variant }: { variant: CharacterVariant }) => (
  <>
    <Path d={CHARACTER_SHAPE_PATH} fill={CHARACTER_COLORS[variant]} />
    {CHARACTER_FACE_PATHS.map((d, index) => (
      <Path key={d} d={d} fill={CHARACTER_FACE_FILLS[index]} />
    ))}
    <Path d={CHARACTER_MOUTH_PATH} fill="black" />
  </>
)

const BlurredBody = ({ variant, blur }: { variant: CharacterVariant; blur: number }) => {
  const samples = [{ dx: 0, dy: 0 }]
  for (let i = 0; i < BLUR_SAMPLE_COUNT - 1; i++) {
    const angle = (2 * Math.PI * i) / (BLUR_SAMPLE_COUNT - 1)
    samples.push({ dx: Math.cos(angle) * blur, dy: Math.sin(angle) * blur })
  }

  return (
    <>
      {samples.map(({ dx, dy }, index) => (
        <G key={index} opacity={1 / (index + 1)} transform={`translate(${dx} ${dy})`}>
          <Body variant={variant} />
        </G>
      ))}
    </>
  )
}

export const Character = ({ variant, size = CHARACTER_BASE_SIZE, shadow, blur: layerBlur }: CharacterProps) => {
  if (!shadow && !layerBlur) {
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${CHARACTER_BASE_SIZE} ${CHARACTER_BASE_SIZE}`}>
        <Body variant={variant} />
      </Svg>
    )
  }

  // shadow/blur 값은 "size 픽셀 기준"으로 받으므로, path 좌표계(CHARACTER_BASE_SIZE)로 환산
  // 해야 함 — 캐릭터마다 size가 달라서(80/120/150...) 그대로 쓰면 작은 캐릭터일수록 효과가
  // 과하게 커지는 왜곡이 생김
  const toPathUnits = CHARACTER_BASE_SIZE / size
  const shadowBlur = shadow ? shadow.blur * toPathUnits : 0
  const offsetY = shadow ? shadow.offsetY * toPathUnits : 0
  const layerBlurPath = layerBlur ? layerBlur * toPathUnits : 0

  // 3-sigma 지점까지 (그 밖은 거의 안 보일 정도로 옅어짐)
  const maxGrowth = shadowBlur * 3

  let shadowLayers: ReactNode = null
  if (shadow) {
    // 레이어별 확산 거리(growth)에 가우시안 가중치를 줘서, 균등 간격일 때보다 가장자리에
    // 진하게 몰리고 바깥으로 갈수록 빠르게 옅어지도록 함 (실제 feGaussianBlur 느낌에 더 가까움)
    const weightedLayers = Array.from({ length: SHADOW_LAYERS }, (_, index) => {
      const growth = (maxGrowth * (index + 1)) / SHADOW_LAYERS
      const weight = Math.exp(-(growth * growth) / (2 * shadowBlur * shadowBlur))
      return { growth, weight }
    })
    const totalWeight = weightedLayers.reduce((sum, { weight }) => sum + weight, 0)

    shadowLayers = [...weightedLayers].reverse().map(({ growth, weight }, index) => {
      const opacity = shadow.opacity * (weight / totalWeight)
      const scale = (CHARACTER_BASE_SIZE + growth * 2) / CHARACTER_BASE_SIZE
      const translateX = CENTER - scale * CENTER
      const translateY = CENTER - scale * CENTER + offsetY
      return (
        <Path
          key={index}
          d={CHARACTER_SHAPE_PATH}
          fill="black"
          fillOpacity={opacity}
          transform={`translate(${translateX} ${translateY}) scale(${scale})`}
        />
      )
    })
  }

  // 그림자/블러가 캔버스 밖으로 번지는 만큼 viewBox를 넓혀서 잘리지 않게 함
  const bleed = Math.max(maxGrowth + Math.abs(offsetY), layerBlurPath * 1.5)
  const canvasSize = CHARACTER_BASE_SIZE + bleed * 2
  const pixelSize = (size * canvasSize) / CHARACTER_BASE_SIZE
  const pixelInset = (pixelSize - size) / 2

  return (
    <Svg
      width={pixelSize}
      height={pixelSize}
      viewBox={`${-bleed} ${-bleed} ${canvasSize} ${canvasSize}`}
      style={{ position: 'absolute', left: -pixelInset, top: -pixelInset }}
    >
      {shadowLayers}
      {layerBlur ? <BlurredBody variant={variant} blur={layerBlurPath} /> : <Body variant={variant} />}
    </Svg>
  )
}
