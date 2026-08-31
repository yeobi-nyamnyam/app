import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { LoadingOverlay } from './LoadingOverlay'

const meta: Meta<typeof LoadingOverlay> = {
  title: 'Components/LoadingOverlay',
  component: LoadingOverlay,
  decorators: [
    (Story) => (
      <View style={{ width: 320, height: 480, backgroundColor: '#ffffff' }}>
        <Story />
      </View>
    ),
  ],
  args: {
    label: '생성 중...',
  },
}

export default meta

type Story = StoryObj<typeof LoadingOverlay>

export const Default: Story = {}

export const WithoutLabel: Story = {
  args: { label: undefined },
}
