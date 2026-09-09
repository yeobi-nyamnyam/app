import type { Meta, StoryObj } from '@storybook/react'
import { CTACard } from './CTACard'

const meta: Meta<typeof CTACard> = {
  title: 'Components/CTACard',
  component: CTACard,
  args: {
    title: '소비 기록 작성',
    description: '끼니 소비와 기타 소비를 기록해보세요',
    buttonLabel: '작성하기',
  },
}

export default meta

type Story = StoryObj<typeof CTACard>

export const Default: Story = {}

export const Diary: Story = {
  args: {
    title: '여행 일기 작성',
    description: '오늘 하루의 여행을 글로 남겨보세요',
  },
}
