import type { Meta, StoryObj } from '@storybook/react'
import { TripCompleteIllustration } from './TripCompleteIllustration'

const meta: Meta<typeof TripCompleteIllustration> = {
  title: 'Components/Character/TripComplete',
  component: TripCompleteIllustration,
  args: {
    size: 120,
  },
}

export default meta

type Story = StoryObj<typeof TripCompleteIllustration>

export const Default: Story = {}
