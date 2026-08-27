import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { View } from 'react-native'
import { Chip } from './Chip'

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    width: { control: 'radio', options: ['fill', 'hug'] },
  },
  args: {
    text: 'Text',
    onPress: action('onPress'),
  },
}

export default meta

type Story = StoryObj<typeof Chip>

export const Inactive: Story = {}

export const Active: Story = {
  args: { active: true },
}

export const InactiveDisabled: Story = {
  args: { disabled: true },
}

export const ActiveDisabled: Story = {
  args: { active: true, disabled: true },
}

export const Fill: Story = {
  args: { width: 'fill' },
}

export const AllStates: Story = {
  render: (args) => (
    <View style={{ gap: 12, alignItems: 'flex-start' }}>
      <Chip {...args} />
      <Chip {...args} active />
      <Chip {...args} disabled />
      <Chip {...args} active disabled />
    </View>
  ),
}
