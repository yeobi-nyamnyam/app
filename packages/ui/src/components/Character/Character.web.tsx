import type { ReactNode } from 'react'
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

// native(Character.tsx)와 렌더링 방식을 맞추기 위해 웹에서도 동일하게 실루엣을 여러 겹
// 쌓아서 흐림을 흉내냄 (필터를 써도 되지만 두 플랫폼 결과물을 동일하게 유지)
const SHADOW_LAYERS = 8
const BLUR_SAMPLE_COUNT = 9

const Body = ({ variant }: { variant: CharacterVariant }) => (
  <>
    <path d={CHARACTER_SHAPE_PATH} fill={CHARACTER_COLORS[variant]} />
    {CHARACTER_FACE_PATHS.map((d, index) => (
      <path key={d} d={d} fill={CHARACTER_FACE_FILLS[index]} />
    ))}
    <path d={CHARACTER_MOUTH_PATH} fill="black" />
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
        <g key={index} opacity={1 / (index + 1)} transform={`translate(${dx} ${dy})`}>
          <Body variant={variant} />
        </g>
      ))}
    </>
  )
}

export const Character = ({ variant, size = CHARACTER_BASE_SIZE, shadow, blur: layerBlur }: CharacterProps) => {
  if (!shadow && !layerBlur) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${CHARACTER_BASE_SIZE} ${CHARACTER_BASE_SIZE}`}>
        <Body variant={variant} />
      </svg>
    )
  }

  const toPathUnits = CHARACTER_BASE_SIZE / size
  const shadowBlur = shadow ? shadow.blur * toPathUnits : 0
  const offsetY = shadow ? shadow.offsetY * toPathUnits : 0
  const layerBlurPath = layerBlur ? layerBlur * toPathUnits : 0

  const maxGrowth = shadowBlur * 3

  let shadowLayers: ReactNode = null
  if (shadow) {
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
        <path
          key={index}
          d={CHARACTER_SHAPE_PATH}
          fill="black"
          fillOpacity={opacity}
          transform={`translate(${translateX} ${translateY}) scale(${scale})`}
        />
      )
    })
  }

  const bleed = Math.max(maxGrowth + Math.abs(offsetY), layerBlurPath * 1.5)
  const canvasSize = CHARACTER_BASE_SIZE + bleed * 2
  const pixelSize = (size * canvasSize) / CHARACTER_BASE_SIZE
  const pixelInset = (pixelSize - size) / 2

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox={`${-bleed} ${-bleed} ${canvasSize} ${canvasSize}`}
      style={{ position: 'absolute', left: -pixelInset, top: -pixelInset }}
    >
      {shadowLayers}
      {layerBlur ? <BlurredBody variant={variant} blur={layerBlurPath} /> : <Body variant={variant} />}
    </svg>
  )
}
