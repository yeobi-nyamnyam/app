import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { RecordCard } from './RecordCard'

const meta: Meta<typeof RecordCard> = {
  title: 'Components/RecordCard',
  component: RecordCard,
  args: {
    title: '친구들과 대구 여행',
    period: '2026.08.12 - 2026.08.14',
    onPress: action('onPress'),
  },
}

export default meta

type Story = StoryObj<typeof RecordCard>

export const TripCard: Story = {
  args: {
    showBudget: false,
  },
}

export const RecordWithBudget: Story = {
  args: {
    title: '북구네 돼지국밥',
    period: '19:20',
    budget: '6,500원',
  },
}

export const WithoutBudget: Story = {
  args: {
    title: '대구에서의 맛있는 하루',
    period: '20:00',
    showBudget: false,
  },
}
