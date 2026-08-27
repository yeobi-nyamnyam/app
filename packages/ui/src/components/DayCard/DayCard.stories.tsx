import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { DayCard } from './DayCard'

const meta: Meta<typeof DayCard> = {
  title: 'Components/DayCard',
  component: DayCard,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    day: '1일차 / 08.12',
    totalBudget: '45,000원',
    breakfast: '12,000원',
    lunch: '15,000원',
    dinner: '18,000원',
  },
}

export default meta

type Story = StoryObj<typeof DayCard>

export const Default: Story = {}
