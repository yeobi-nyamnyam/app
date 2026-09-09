import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { BudgetRatioRow } from './BudgetRatioRow'

const meta: Meta<typeof BudgetRatioRow> = {
  title: 'Components/BudgetRatioRow',
  component: BudgetRatioRow,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    label: '제주 봄 여행',
    ratio: 87,
  },
}

export default meta

type Story = StoryObj<typeof BudgetRatioRow>

export const Default: Story = {}

export const Selected: Story = {
  args: { selected: true },
}

export const Over: Story = {
  args: { label: '경주 당일치기', ratio: 102 },
}

const ListExample = () => {
  const [selectedId, setSelectedId] = useState('all')
  const rows = [
    { id: 'all', label: '전체', ratio: 68 },
    { id: '1', label: '제주 봄 여행', ratio: 87 },
    { id: '2', label: '부산 2박 3일 (진행)', ratio: 43 },
    { id: '3', label: '경주 당일치기', ratio: 102 },
  ]
  return (
    <View style={{ gap: 4 }}>
      {rows.map((row) => (
        <BudgetRatioRow
          key={row.id}
          label={row.label}
          ratio={row.ratio}
          selected={selectedId === row.id}
          onPress={() => setSelectedId(row.id)}
        />
      ))}
    </View>
  )
}

export const List: Story = {
  render: () => <ListExample />,
}
