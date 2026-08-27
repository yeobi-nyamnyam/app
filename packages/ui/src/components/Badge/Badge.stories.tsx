import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    variant: { control: 'radio', options: ['grey', 'sky', 'slate'] },
  },
  args: {
    label: 'Badge Value',
  },
}

export default meta

type Story = StoryObj<typeof Badge>

export const Grey: Story = {}

export const Sky: Story = {
  args: { variant: 'sky' },
}

export const Slate: Story = {
  args: { variant: 'slate' },
}

export const AllVariants: Story = {
  render: (args) => (
    <View style={{ gap: 8, alignItems: 'flex-start' }}>
      <Badge {...args} variant="grey" />
      <Badge {...args} variant="sky" />
      <Badge {...args} variant="slate" />
    </View>
  ),
}
