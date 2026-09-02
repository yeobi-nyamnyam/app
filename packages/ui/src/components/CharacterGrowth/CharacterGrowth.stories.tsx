import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { CharacterGrowth } from './CharacterGrowth'

const meta: Meta<typeof CharacterGrowth> = {
  title: 'Components/Character/Growth',
  component: CharacterGrowth,
  argTypes: {
    stage: { control: 'select', options: [1, 2, 3, 4, 5] },
  },
  args: {
    stage: 1,
    size: 44,
  },
}

export default meta

type Story = StoryObj<typeof CharacterGrowth>

export const Stage1: Story = {
  args: { stage: 1 },
}

export const Stage2: Story = {
  args: { stage: 2 },
}

export const Stage3: Story = {
  args: { stage: 3 },
}

export const Stage4: Story = {
  args: { stage: 4 },
}

export const Stage5: Story = {
  args: { stage: 5 },
}

export const AllStages: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <CharacterGrowth stage={1} />
      <CharacterGrowth stage={2} />
      <CharacterGrowth stage={3} />
      <CharacterGrowth stage={4} />
      <CharacterGrowth stage={5} />
    </View>
  ),
}

export const Large: Story = {
  args: { stage: 2, size: 130 },
}
