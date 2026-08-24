import Svg, { Path } from 'react-native-svg'
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
 * @param variant 캐릭터 종류: 'apricot' | 'aqua' | 'sky' | 'slate' | 'coral'
 * @param size 한 변의 픽셀 크기 (optional, 기본값 88)
 */
export interface CharacterProps {
  variant: CharacterVariant
  size?: number
}

export const Character = ({ variant, size = CHARACTER_BASE_SIZE }: CharacterProps) => {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${CHARACTER_BASE_SIZE} ${CHARACTER_BASE_SIZE}`}>
      <Path d={CHARACTER_SHAPE_PATH} fill={CHARACTER_COLORS[variant]} />
      {CHARACTER_FACE_PATHS.map((d, index) => (
        <Path key={d} d={d} fill={CHARACTER_FACE_FILLS[index]} />
      ))}
      <Path d={CHARACTER_MOUTH_PATH} fill="black" />
    </Svg>
  )
}
