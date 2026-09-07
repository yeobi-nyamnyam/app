import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { TripSummaryCard } from './TripSummaryCard'

const meta: Meta<typeof TripSummaryCard> = {
  title: 'Components/TripSummaryCard',
  component: TripSummaryCard,
  decorators: [
    (Story) => (
      <View style={{ width: 358, padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    title: '제주 봄 여행',
    subtitle: '2026.04.11 - 04.14 · 제주',
    ratioLabel: '87%',
    tagLabel: '예산 준수',
    tagVariant: 'success',
  },
}

export default meta

type Story = StoryObj<typeof TripSummaryCard>

export const WithinBudget: Story = {}

export const OverBudget: Story = {
  args: {
    title: '경주 당일치기',
    subtitle: '2026.02.03 · 경주',
    ratioLabel: '102%',
    tagLabel: '소폭 초과',
    tagVariant: 'warning',
  },
}

export const List: Story = {
  render: () => (
    <View style={{ gap: 10 }}>
      <TripSummaryCard
        title="제주 봄 여행"
        subtitle="2026.04.11 - 04.14 · 제주"
        ratioLabel="87%"
        tagLabel="예산 준수"
        tagVariant="success"
      />
      <TripSummaryCard
        title="경주 당일치기"
        subtitle="2026.02.03 · 경주"
        ratioLabel="102%"
        tagLabel="소폭 초과"
        tagVariant="warning"
      />
      <TripSummaryCard
        title="강릉 1박 2일"
        subtitle="2025.11.22 - 11.23 · 강릉"
        ratioLabel="94%"
        tagLabel="예산 준수"
        tagVariant="success"
      />
    </View>
  ),
}
