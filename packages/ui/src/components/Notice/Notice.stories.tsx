import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { Notice } from './Notice'

const meta: Meta<typeof Notice> = {
  title: 'Components/Notice',
  component: Notice,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    variant: { control: 'radio', options: ['grey', 'yellow', 'sky'] },
  },
  args: {
    title: 'Title',
    content: 'Content',
  },
}

export default meta

type Story = StoryObj<typeof Notice>

export const Grey: Story = {}

export const Yellow: Story = {
  args: { variant: 'yellow' },
}

export const Sky: Story = {
  args: { variant: 'sky' },
}

export const AllVariants: Story = {
  render: (args) => (
    <View style={{ gap: 12 }}>
      <Notice {...args} variant="grey" />
      <Notice {...args} variant="yellow" />
      <Notice {...args} variant="sky" />
    </View>
  ),
}
