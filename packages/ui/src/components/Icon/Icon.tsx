import { View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { colors, icon as iconSize } from '@repo/tokens'
import { ICON_BASE_SIZE, icons, type IconName } from './icons'

export type { IconName }
export type IconSize = keyof typeof iconSize

/**
 * @param name 아이콘 종류: 'bulb' | 'link-horizontal' | 'puzzle' | 'chevron-left' |
 * 'chevron-down' | 'chevron-up' | 'home' | 'recommend' | 'chat' | 'record' | 'profile' |
 * 'camera' | 'krw' | 'arrow-right' | 'swap' | 'search' | 'restaurant'
 * @param size 아이콘이 차지하는 정사각형 영역 크기: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' (optional, 기본값 'medium')
 * @param color 아이콘 색상. 획(stroke) 아이콘은 선 색, 채우기(fill) 아이콘은 도형 색으로 쓰임 (optional, 기본값 content/neutral/default)
 */
export interface IconProps {
  name: IconName
  size?: IconSize
  color?: string
}

export const Icon = ({ name, size = 'medium', color = colors.content.neutral.default }: IconProps) => {
  const box = iconSize[size]
  const { width, height, d, fill } = icons[name]
  const scale = box / ICON_BASE_SIZE

  return (
    <View style={{ width: box, height: box, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width * scale} height={height * scale} viewBox={`0 0 ${width} ${height}`} fill="none">
        {fill ? (
          <Path d={d} fill={color} />
        ) : (
          <Path d={d} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        )}
      </Svg>
    </View>
  )
}
