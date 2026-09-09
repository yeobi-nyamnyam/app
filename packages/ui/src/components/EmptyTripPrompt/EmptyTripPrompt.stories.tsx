import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { EmptyTripPrompt } from './EmptyTripPrompt'

const meta: Meta<typeof EmptyTripPrompt> = {
  title: 'Components/EmptyTripPrompt',
  component: EmptyTripPrompt,
  args: {
    onCreateTrip: action('onCreateTrip'),
  },
}

export default meta

type Story = StoryObj<typeof EmptyTripPrompt>

export const Default: Story = {}
