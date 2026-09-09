import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { Alert } from './Alert'

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    variant: { control: 'radio', options: ['warn', 'error', 'info'] },
  },
  args: {
    title: 'Title',
    content: 'Content',
  },
}

export default meta

type Story = StoryObj<typeof Alert>

export const Warn: Story = {}

export const Error: Story = {
  args: { variant: 'error' },
}

export const Info: Story = {
  args: { variant: 'info' },
}

export const AllVariants: Story = {
  render: (args) => (
    <View style={{ gap: 12 }}>
      <Alert {...args} variant="warn" />
      <Alert {...args} variant="error" />
      <Alert {...args} variant="info" />
    </View>
  ),
}
