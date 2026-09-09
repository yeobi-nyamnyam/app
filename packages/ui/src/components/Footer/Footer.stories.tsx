import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { View } from 'react-native'
import { Footer } from './Footer'

const meta: Meta<typeof Footer> = {
  title: 'Components/Footer',
  component: Footer,
  decorators: [
    (Story) => (
      <View style={{ width: 402 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    label: '확인',
    disabled: true,
    onPress: action('onPress'),
  },
}

export default meta

type Story = StoryObj<typeof Footer>

export const Disabled: Story = {}

export const Enabled: Story = {
  args: { disabled: false },
}

export const WithBottomInset: Story = {
  args: { disabled: false, bottomInset: 24 },
}
