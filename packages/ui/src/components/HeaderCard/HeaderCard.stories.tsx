import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { HeaderCard } from './HeaderCard'

const meta: Meta<typeof HeaderCard> = {
  title: 'Components/HeaderCard',
  component: HeaderCard,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    state: { control: 'radio', options: ['default', 'plus', 'minus'] },
  },
  args: {
    title: '친구들과 대구 여행 | 2일차',
    consumed: '0원',
    dayBudget: '45,000원',
  },
}

export default meta

type Story = StoryObj<typeof HeaderCard>

export const Default: Story = {
  args: {
    state: 'default',
  },
}

export const Plus: Story = {
  args: {
    state: 'plus',
    extraBudget: '0원',
  },
}

export const Minus: Story = {
  args: {
    state: 'minus',
    extraBudget: '0원',
  },
}

export const AllStates: Story = {
  render: (args) => (
    <View style={{ gap: 16 }}>
      <HeaderCard {...args} state="default" />
      <HeaderCard {...args} state="plus" extraBudget="3,500원" />
      <HeaderCard {...args} state="minus" extraBudget="2,000원" />
    </View>
  ),
}
