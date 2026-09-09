import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, stroke, typography } from '@repo/tokens'
import { getFontFamily } from '../../typography/getFontFamily'
import { Badge } from '../Badge'
import { CTACard } from '../CTACard'

export type ChatBubbleSender = 'ai' | 'user'
export type ChatBubbleVariant = 'text' | 'waiting' | 'confirmed' | 'cta'

/**
 * @param sender 발신자: 'ai' | 'user'
 * @param variant 말풍선 종류: 'text' | 'waiting' | 'confirmed' | 'cta' (optional, 기본값 'text').
 * 'waiting' | 'confirmed' | 'cta'는 sender가 'ai'일 때만 쓰인다
 * @param text 말풍선에 표시할 메시지, variant가 'text'일 때만 쓰인다
 * @param categoryLabel 소비 확정 배지 텍스트 (예: "기념품"), variant가 'confirmed'일 때만 쓰인다
 * @param time 소비 확정 시각 텍스트 (예: "18:42"), variant가 'confirmed'일 때만 쓰인다
 * @param price 소비 확정 금액 텍스트 (예: "8,000"), variant가 'confirmed'일 때만 쓰인다.
 * "{price}원 기록됨" 형태로 표시된다
 * @param title CTA 카드 제목, variant가 'cta'일 때만 쓰이며 없으면 설명 텍스트만 표시된다 (optional)
 * @param description CTA 카드 설명 텍스트, variant가 'cta'일 때만 쓰인다
 * @param buttonLabel CTA 카드 버튼 텍스트, variant가 'cta'일 때만 쓰인다
 * @param onButtonPress CTA 카드 버튼을 클릭할 때 발생하는 event 명시, variant가 'cta'일 때만 쓰인다 (optional)
 */
export interface ChatBubbleProps {
  sender: ChatBubbleSender
  variant?: ChatBubbleVariant
  text?: string
  categoryLabel?: string
  time?: string
  price?: string
  title?: string
  description?: string
  buttonLabel?: string
  onButtonPress?: () => void
}

/**
 * 채팅 화면의 메시지 말풍선 (Figma "Bubble", node-id=741-17453).
 * AI/사용자 텍스트, AI 응답 대기(...), 소비 확정, 추천/기록 유도 카드까지 한 컴포넌트로 표현한다.
 */
export const ChatBubble = ({
  sender,
  variant = 'text',
  text,
  categoryLabel,
  time,
  price,
  title,
  description,
  buttonLabel,
  onButtonPress,
}: ChatBubbleProps) => {
  const isUser = sender === 'user'

  if (variant === 'cta') {
    return (
      <View style={styles.wrapper}>
        <View style={styles.ctaCard}>
          <CTACard
            title={title}
            description={description ?? ''}
            buttonLabel={buttonLabel ?? ''}
            onPress={onButtonPress}
          />
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.wrapper, isUser && styles.wrapperEnd]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi, variant === 'confirmed' && styles.bubbleConfirmed]}>
        {variant === 'confirmed' ? (
          <>
            <View style={styles.confirmedRow}>
              <Badge label={categoryLabel ?? ''} variant="slate" />
              <Text style={styles.confirmedTime}>{time}</Text>
            </View>
            <Text style={styles.confirmedPrice}>{price}원 기록됨</Text>
          </>
        ) : (
          <Text style={[styles.text, isUser ? styles.textUser : styles.textAi]}>
            {variant === 'waiting' ? '...' : text}
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'flex-start',
  },
  wrapperEnd: {
    alignItems: 'flex-end',
  },
  ctaCard: {
    width: 256,
  },
  bubble: {
    maxWidth: 256,
    flexShrink: 1,
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
  },
  bubbleAi: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface.neutral.default,
    borderWidth: stroke.hairline,
    borderColor: colors.border.neutral.default,
    borderRadius: radius[26],
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.surface.primary.default,
    borderRadius: radius[26],
  },
  bubbleConfirmed: {
    backgroundColor: colors.surface.primary.subtlest,
    borderWidth: stroke.hairline,
    borderColor: colors.border.primary.default,
    borderRadius: radius[23],
    gap: spacing[4],
  },
  text: {
    fontFamily: getFontFamily(typography.bodyRegular.fontWeight),
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    fontWeight: typography.bodyRegular.fontWeight,
  },
  textAi: {
    color: colors.content.neutral.default,
  },
  textUser: {
    color: colors.content.neutral.inverse,
  },
  confirmedRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  confirmedTime: {
    fontFamily: getFontFamily(typography.subheadlineRegular.fontWeight),
    fontSize: typography.subheadlineRegular.fontSize,
    lineHeight: typography.subheadlineRegular.lineHeight,
    letterSpacing: typography.subheadlineRegular.letterSpacing,
    fontWeight: typography.subheadlineRegular.fontWeight,
    color: colors.content.neutral.default,
  },
  confirmedPrice: {
    fontFamily: getFontFamily(typography.bodyEmphasized.fontWeight),
    fontSize: typography.bodyEmphasized.fontSize,
    lineHeight: typography.bodyEmphasized.lineHeight,
    letterSpacing: typography.bodyEmphasized.letterSpacing,
    fontWeight: typography.bodyEmphasized.fontWeight,
    color: colors.content.primary.bold,
  },
})
