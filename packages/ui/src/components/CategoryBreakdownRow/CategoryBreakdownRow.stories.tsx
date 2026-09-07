import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { CategoryBreakdownRow } from './CategoryBreakdownRow'

const meta: Meta<typeof CategoryBreakdownRow> = {
  title: 'Components/CategoryBreakdownRow',
  component: CategoryBreakdownRow,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    label: '식비',
    amount: '57,600원',
    percent: 52,
    dotColor: '#8dd7fb',
  },
}

export default meta

type Story = StoryObj<typeof CategoryBreakdownRow>

export const Default: Story = {}

export const List: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <CategoryBreakdownRow label="식비" amount="57,600원" percent={52} dotColor="#8dd7fb" />
      <CategoryBreakdownRow label="교통" amount="25,000원" percent={23} dotColor="#ffc067" />
      <CategoryBreakdownRow label="기념품" amount="16,000원" percent={15} dotColor="#ff708f" />
      <CategoryBreakdownRow label="기타" amount="11,000원" percent={10} dotColor="#66c4ff" />
    </View>
  ),
}
