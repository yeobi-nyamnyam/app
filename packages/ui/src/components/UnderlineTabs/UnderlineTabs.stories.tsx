import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { UnderlineTabs } from './UnderlineTabs'

const meta: Meta<typeof UnderlineTabs> = {
  title: 'Components/UnderlineTabs',
  component: UnderlineTabs,
  args: {
    tabs: ['기록 작성하기', '기록보기'],
    activeIndex: 0,
    onChange: action('onChange'),
  },
}

export default meta

type Story = StoryObj<typeof UnderlineTabs>

export const First: Story = {}

export const Second: Story = {
  args: { activeIndex: 1 },
}
