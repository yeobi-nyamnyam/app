import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { MealCard } from './MealCard'

const meta: Meta<typeof MealCard> = {
  title: 'Components/MealCard',
  component: MealCard,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    state: { control: 'radio', options: ['pending', 'active', 'done'] },
  },
  args: {
    meal: 'Meal',
    budget: '12,000원',
  },
}

export default meta

type Story = StoryObj<typeof MealCard>

export const Pending: Story = {}

export const Active: Story = {
  args: { state: 'active' },
}

export const Done: Story = {
  args: { state: 'done' },
}

export const DoneWithExcess: Story = {
  args: { state: 'done', showExcess: true },
}

export const AllStates: Story = {
  render: (args) => (
    <View style={{ gap: 12 }}>
      <MealCard {...args} state="pending" />
      <MealCard {...args} state="active" />
      <MealCard {...args} state="done" />
      <MealCard {...args} state="done" showExcess />
    </View>
  ),
}
