import { useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg'
import { Character, Icon, ListRow, colors, spacing, typography } from '@repo/ui'
import {
  DRAFTS,
  REFERENCE_HEIGHT,
  REFERENCE_WIDTH,
  SUBTITLE_LINES,
  SUBTITLE_TEXT_COLOR,
  TIP_ROWS,
  TITLE_TEXT_COLOR,
} from './splashContent'

const START_DURATION = 1600
const REVEAL_DURATION = 450
const HOLD_DURATION = 1500

const TITLE_TOP_START = 351
const TITLE_TOP_DRAFT = 231
const TITLE_LEFT = spacing[36] // Figma 좌측 여백과 값이 같아 토큰을 그대로 사용
const TITLE_WIDTH = 330

const CONTENT_TOP = 392
const CONTENT_REVEAL_OFFSET = 24

/**
 * @param onFinish 스플래시 노출이 끝났을 때 호출되는 콜백 (실제 화면으로 전환)
 */
export interface SplashProps {
  onFinish: () => void
}

export const Splash = ({ onFinish }: SplashProps) => {
  const { width: screenWidth } = useWindowDimensions()
  const scale = screenWidth / REFERENCE_WIDTH
  const screenHeight = REFERENCE_HEIGHT * scale

  const [stage, setStage] = useState<'start' | 'draft'>('start')
  const [draftIndex] = useState(() => Math.floor(Math.random() * DRAFTS.length))
  const reveal = useRef(new Animated.Value(0)).current
  const draft = useMemo(() => DRAFTS[draftIndex] ?? DRAFTS[0]!, [draftIndex])

  useEffect(() => {
    const toDraftTimer = setTimeout(() => {
      setStage('draft')
      Animated.timing(reveal, {
        toValue: 1,
        duration: REVEAL_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start()
    }, START_DURATION)

    const finishTimer = setTimeout(onFinish, START_DURATION + REVEAL_DURATION + HOLD_DURATION)

    return () => {
      clearTimeout(toDraftTimer)
      clearTimeout(finishTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const titleTranslateY = reveal.interpolate({
    inputRange: [0, 1],
    outputRange: [(TITLE_TOP_START - TITLE_TOP_DRAFT) * scale, 0],
  })
  const contentTranslateY = reveal.interpolate({
    inputRange: [0, 1],
    outputRange: [CONTENT_REVEAL_OFFSET * scale, 0],
  })

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface.neutral.default }]}>
      <View style={{ width: screenWidth, height: screenHeight }}>
        <BlurBackground width={screenWidth} height={screenHeight} />

        <Animated.View
          style={[
            styles.title,
            {
              left: TITLE_LEFT * scale,
              width: TITLE_WIDTH * scale,
              top: TITLE_TOP_DRAFT * scale,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          <Text style={[styles.titleText, { color: TITLE_TEXT_COLOR, fontSize: 48 * scale }]}>
            여비냠냠
          </Text>
          <Text style={[styles.subtitleText, { color: SUBTITLE_TEXT_COLOR, fontSize: 15 * scale }]}>
            {SUBTITLE_LINES.join('\n')}
          </Text>
        </Animated.View>

        {stage === 'draft' && (
          <Animated.View
            style={[
              styles.content,
              {
                top: CONTENT_TOP * scale,
                opacity: reveal,
                transform: [{ translateY: contentTranslateY }],
              },
            ]}
          >
            {/* 캐릭터를 tip 목록보다 먼저 그려서 뒤에 깔리게 함 (Figma에서 draft 3의
                apricot가 tip 목록 위로 살짝 겹치는 레이어 순서와 동일) */}
            {draft.map((character) => {
              const boundingSize = character.boundingSize ?? character.size
              const inset = ((boundingSize - character.size) / 2) * scale

              return (
                <View
                  key={character.variant}
                  style={{
                    position: 'absolute',
                    left: character.left * scale,
                    top: (character.top - CONTENT_TOP) * scale,
                    width: boundingSize * scale,
                    height: boundingSize * scale,
                  }}
                >
                  <View
                    style={[
                      { position: 'absolute', left: inset, top: inset },
                      character.rotation
                        ? { transform: [{ rotate: `${character.rotation}deg` }] }
                        : undefined,
                    ]}
                  >
                    <Character
                      variant={character.variant}
                      size={character.size * scale}
                      shadow={
                        character.shadow && {
                          offsetY: character.shadow.offsetY * scale,
                          blur: character.shadow.blur * scale,
                          opacity: character.shadow.opacity,
                        }
                      }
                      blur={character.blur && character.blur * scale}
                    />
                  </View>
                </View>
              )
            })}

            <View style={{ paddingHorizontal: TITLE_LEFT * scale, gap: spacing[8] * scale }}>
              {TIP_ROWS.map((row) => (
                <ListRow key={row.title} icon={<Icon name={row.icon} />} title={row.title} />
              ))}
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  )
}

const BlurBackground = ({ width, height }: { width: number; height: number }) => (
  <Svg
    width={width}
    height={height}
    viewBox={`0 0 ${REFERENCE_WIDTH} ${REFERENCE_HEIGHT}`}
    style={StyleSheet.absoluteFill}
  >
    <Defs>
      <RadialGradient id="splashBlurBlue" cx="54.5" cy="100.5" r="260" gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor="#529DCC" stopOpacity={0.4} />
        <Stop offset="1" stopColor="#529DCC" stopOpacity={0} />
      </RadialGradient>
      <RadialGradient id="splashBlurPeach" cx="347.5" cy="100.5" r="260" gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor="#FFC067" stopOpacity={0.3} />
        <Stop offset="1" stopColor="#FFC067" stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Rect x={0} y={0} width={REFERENCE_WIDTH} height={REFERENCE_HEIGHT} fill="url(#splashBlurBlue)" />
    <Rect x={0} y={0} width={REFERENCE_WIDTH} height={REFERENCE_HEIGHT} fill="url(#splashBlurPeach)" />
  </Svg>
)

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    position: 'absolute',
    alignItems: 'center',
    gap: spacing[4],
  },
  titleText: {
    fontFamily: 'WILDgag-Bold',
    textAlign: 'center',
  },
  subtitleText: {
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
  },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
})
