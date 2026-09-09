import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { Track } from './Track'

const meta: Meta<typeof Track> = {
  title: 'Components/Track',
  component: Track,
  decorators: [
    (Story) => (
      <View style={{ padding: 16, width: 356 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    progress: { control: { type: 'range', min: 0, max: 150, step: 1 } },
  },
  args: {
    progress: 30,
  },
}

export default meta

type Story = StoryObj<typeof Track>

export const Progress30: Story = {}

export const Progress65: Story = {
  args: { progress: 65 },
}

export const Over: Story = {
  args: { progress: 120 },
}

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 20 }}>
      <Track progress={30} />
      <Track progress={65} />
      <Track progress={120} />
    </View>
  ),
}
