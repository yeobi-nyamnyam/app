import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { ChatLogRow } from './ChatLogRow'

const meta: Meta<typeof ChatLogRow> = {
  title: 'Components/ChatLogRow',
  component: ChatLogRow,
  decorators: [
    (Story) => (
      <View style={{ padding: 16, width: 370 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    title: '미분당',
    time: '19:20',
    categoryLabel: '점심',
    price: '13,000원',
  },
}

export default meta

type Story = StoryObj<typeof ChatLogRow>

export const Default: Story = {}
