import { View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import type { AlertVariant } from './Alert'

// Figma "Sign" 컴포넌트의 실제 SVG를 그대로 옮김 (경고/에러/정보는 고정된 다색
// 아이콘이라 단색 stroke만 지원하는 공용 Icon 컴포넌트로는 표현할 수 없음)
export const AlertSign = ({ variant }: { variant: AlertVariant }) => {
  return (
    <View style={{ width: 24, height: 24 }}>
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        {variant === 'warn' && (
          <>
            <Path
              d="M10.4972 4.85092L2.7957 17.3485C2.63692 17.6158 2.5529 17.9188 2.55201 18.2275C2.55112 18.5361 2.63339 18.8396 2.79063 19.1078C2.94788 19.3759 3.17461 19.5994 3.44829 19.7559C3.72196 19.9125 4.03303 19.9966 4.35054 20H19.7535C20.071 19.9966 20.382 19.9125 20.6557 19.7559C20.9294 19.5994 21.1561 19.3759 21.3134 19.1078C21.4706 18.8396 21.5529 18.5361 21.552 18.2275C21.5511 17.9188 21.4671 17.6158 21.3083 17.3485L13.6068 4.85092C13.4447 4.59116 13.2165 4.3764 12.9442 4.22735C12.6718 4.0783 12.3645 4 12.052 4C11.7395 4 11.4322 4.0783 11.1598 4.22735C10.8875 4.3764 10.6593 4.59116 10.4972 4.85092Z"
              fill="#EFBB00"
              stroke="#EFBB00"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 9V13M12 17H12.01"
              stroke="#181818"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
        {variant === 'error' && (
          <>
            <Path
              d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
              fill="#EB2032"
              stroke="#EB2032"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M15 9L9 15M9 9L15 15"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
        {variant === 'info' && (
          <>
            <Path
              d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
              fill="#8DD7FB"
              stroke="#8DD7FB"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 16V12M12 8H12.01"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
      </Svg>
    </View>
  )
}
