import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { ChatLogList } from './ChatLogList'

const meta: Meta<typeof ChatLogList> = {
  title: 'Components/ChatLogList',
  component: ChatLogList,
  decorators: [
    (Story) => (
      <View style={{ padding: 16, width: 402 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    day: '08.12 | 1일차',
    items: [{ id: '1', title: 'Title', time: '19:20', categoryLabel: 'type', price: '0원' }],
  },
}

export default meta

type Story = StoryObj<typeof ChatLogList>

export const OneRow: Story = {}

export const TwoRows: Story = {
  args: {
    items: [
      { id: '1', title: '미분당', time: '19:20', categoryLabel: '점심', price: '13,000원' },
      { id: '2', title: '스타벅스', time: '15:40', categoryLabel: '기타', price: '5,900원' },
    ],
  },
}

export const ThreeRows: Story = {
  args: {
    items: [
      { id: '1', title: '미분당', time: '19:20', categoryLabel: '점심', price: '13,000원' },
      { id: '2', title: '스타벅스', time: '15:40', categoryLabel: '기타', price: '5,900원' },
      { id: '3', title: '삼겹살집', time: '20:10', categoryLabel: '저녁', price: '32,000원' },
    ],
  },
}
