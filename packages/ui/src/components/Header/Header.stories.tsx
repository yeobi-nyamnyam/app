import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { View } from 'react-native'
import { Header } from './Header'

const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  decorators: [
    (Story) => (
      <View style={{ width: 402 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    textAlign: { control: 'radio', options: ['center', 'start'] },
    tailing: { control: 'radio', options: ['none', 'text'] },
  },
  args: {
    title: 'title',
    onBackPress: action('onBackPress'),
  },
}

export default meta

type Story = StoryObj<typeof Header>

export const CenteredTitle: Story = {}

export const StartTitleWithTailingText: Story = {
  args: {
    textAlign: 'start',
    tailing: 'text',
    tailingText: '완료',
    onTailingPress: action('onTailingPress'),
  },
}
