import Svg, { Path } from 'react-native-svg'
import { GROWTH_STAGE_SHAPES, type GrowthStage } from './growthStages'

export type { GrowthStage }

/**
 * @param stage 캐릭터 성장 단계: 1 | 2 | 3 | 4 | 5 (Lv1~2 / Lv3~4 / Lv5~6 / Lv7~9 / Lv10+에 대응)
 * @param size 한 변의 픽셀 크기 (optional, 기본값 44)
 */
export interface CharacterGrowthProps {
  stage: GrowthStage
  size?: number
}

export const CharacterGrowth = ({ stage, size = 44 }: CharacterGrowthProps) => {
  const shape = GROWTH_STAGE_SHAPES[stage]
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${shape.viewBoxSize} ${shape.viewBoxSize}`} fill="none">
      {shape.paths.map((path) => (
        <Path key={path.d} d={path.d} fill={path.fill} />
      ))}
    </Svg>
  )
}
