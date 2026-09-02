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
    variant: { control: 'radio', options: ['grey', 'sky', 'slate', 'success', 'warning'] },
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

export const Success: Story = {
  args: { label: '예산 준수', variant: 'success' },
}

export const Warning: Story = {
  args: { label: '소폭 초과', variant: 'warning' },
}

export const AllVariants: Story = {
  render: (args) => (
    <View style={{ gap: 8, alignItems: 'flex-start' }}>
      <Badge {...args} variant="grey" />
      <Badge {...args} variant="sky" />
      <Badge {...args} variant="slate" />
      <Badge label="예산 준수" variant="success" />
      <Badge label="소폭 초과" variant="warning" />
    </View>
  ),
}
