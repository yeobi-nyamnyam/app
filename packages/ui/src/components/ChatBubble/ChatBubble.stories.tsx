import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { action } from '@storybook/addon-actions'
import { ChatBubble } from './ChatBubble'

const meta: Meta<typeof ChatBubble> = {
  title: 'Components/ChatBubble',
  component: ChatBubble,
  decorators: [
    (Story) => (
      <View style={{ padding: 16, width: 402 }}>
        <Story />
      </View>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof ChatBubble>

export const AiText: Story = {
  args: {
    sender: 'ai',
    text: '점심까지 13,000원 썼어요. 저녁은 32,000원 안에서 편하게 골라도 돼요!',
  },
}

export const UserText: Story = {
  args: {
    sender: 'user',
    text: '방금 기념품 8천원 썼어!',
  },
}

export const Waiting: Story = {
  args: {
    sender: 'ai',
    variant: 'waiting',
  },
}

export const Confirmed: Story = {
  args: {
    sender: 'ai',
    variant: 'confirmed',
    categoryLabel: '기념품',
    time: '18:42',
    price: '8,000',
  },
}

export const CtaWithTitle: Story = {
  args: {
    sender: 'ai',
    variant: 'cta',
    title: '2,000원',
    description: '오늘 남은 식비가 줄었어요. 추천에서 다시 골라보세요.',
    buttonLabel: '새 추천 보기',
    onButtonPress: action('onButtonPress'),
  },
}

export const CtaWithoutTitle: Story = {
  args: {
    sender: 'ai',
    variant: 'cta',
    description: '저녁은 얼마 썼어요?',
    buttonLabel: '메뉴 기록',
    onButtonPress: action('onButtonPress'),
  },
}
