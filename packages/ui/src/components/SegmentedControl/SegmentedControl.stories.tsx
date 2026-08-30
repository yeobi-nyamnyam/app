import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { SegmentedControl } from './SegmentedControl'

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  args: {
    options: ['가격보기', '지도보기'],
    selectedIndex: 0,
    onChange: action('onChange'),
  },
}

export default meta

type Story = StoryObj<typeof SegmentedControl>

export const First: Story = {}

export const Second: Story = {
  args: { selectedIndex: 1 },
}
