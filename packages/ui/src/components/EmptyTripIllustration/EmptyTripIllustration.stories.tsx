import type { Meta, StoryObj } from '@storybook/react'
import { EmptyTripIllustration } from './EmptyTripIllustration'

const meta: Meta<typeof EmptyTripIllustration> = {
  title: 'Components/Character/EmptyTrip',
  component: EmptyTripIllustration,
  args: {
    size: 120,
  },
}

export default meta

type Story = StoryObj<typeof EmptyTripIllustration>

export const Default: Story = {}
