import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { MealTimeBarChart } from './MealTimeBarChart'

const meta: Meta<typeof MealTimeBarChart> = {
  title: 'Components/MealTimeBarChart',
  component: MealTimeBarChart,
  decorators: [
    (Story) => (
      <View style={{ padding: 16, backgroundColor: 'white' }}>
        <Story />
      </View>
    ),
  ],
  args: {
    items: [
      { label: '아침', value: 6200, valueLabel: '6200' },
      { label: '점심', value: 11800, valueLabel: '11800' },
      { label: '저녁', value: 14600, valueLabel: '14600' },
    ],
  },
}

export default meta

type Story = StoryObj<typeof MealTimeBarChart>

export const Default: Story = {}

export const WithEmptySlot: Story = {
  args: {
    items: [
      { label: '아침', value: 0, valueLabel: '0' },
      { label: '점심', value: 9800, valueLabel: '9800' },
      { label: '저녁', value: 12400, valueLabel: '12400' },
    ],
  },
}
