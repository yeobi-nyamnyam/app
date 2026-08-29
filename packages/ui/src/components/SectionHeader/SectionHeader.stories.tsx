import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { SectionHeader } from './SectionHeader'

const meta: Meta<typeof SectionHeader> = {
  title: 'Components/SectionHeader',
  component: SectionHeader,
  decorators: [
    (Story) => (
      <View style={{ width: 402 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    title: '채팅',
  },
}

export default meta

type Story = StoryObj<typeof SectionHeader>

export const Default: Story = {}
