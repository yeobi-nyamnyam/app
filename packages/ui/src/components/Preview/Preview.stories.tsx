import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { Preview } from './Preview'

const meta: Meta<typeof Preview> = {
  title: 'Components/Preview',
  component: Preview,
  args: {
    name: '범물본가국수 팔달시장점',
    category: '한식',
    distance: '0.3km',
    price: '6,000원',
    showPrice: true,
    onPressDetail: action('onPressDetail'),
  },
}

export default meta

type Story = StoryObj<typeof Preview>

export const Default: Story = {}

export const WithoutPrice: Story = {
  args: { showPrice: false },
}
