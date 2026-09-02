import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { SummaryStatsCard } from './SummaryStatsCard'

const meta: Meta<typeof SummaryStatsCard> = {
  title: 'Components/SummaryStatsCard',
  component: SummaryStatsCard,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    stats: [
      { value: '124,800원', label: '총 지출' },
      { value: '78%', label: '예산 대비' },
      { value: '34,200원', label: '남은 예산' },
    ],
  },
}

export default meta

type Story = StoryObj<typeof SummaryStatsCard>

export const Default: Story = {}

export const OverBudget: Story = {
  args: {
    stats: [
      { value: '142,000원', label: '총 지출' },
      { value: '118%', label: '예산 대비' },
      { value: '-22,000원', label: '남은 예산', tone: 'error' },
    ],
  },
}
