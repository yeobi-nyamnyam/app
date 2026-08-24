import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { Icon } from './Icon'

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  argTypes: {
    name: { control: 'select', options: ['bulb', 'link-horizontal', 'puzzle'] },
    size: { control: 'select', options: ['xsmall', 'small', 'medium', 'large', 'xlarge'] },
  },
  args: {
    name: 'bulb',
  },
}

export default meta

type Story = StoryObj<typeof Icon>

export const Bulb: Story = {
  args: { name: 'bulb' },
}

export const LinkHorizontal: Story = {
  args: { name: 'link-horizontal' },
}

export const Puzzle: Story = {
  args: { name: 'puzzle' },
}

export const AllSizes: Story = {
  render: (args) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <Icon {...args} size="xsmall" />
      <Icon {...args} size="small" />
      <Icon {...args} size="medium" />
      <Icon {...args} size="large" />
      <Icon {...args} size="xlarge" />
    </View>
  ),
}
