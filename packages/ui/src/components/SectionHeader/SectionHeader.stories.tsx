import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { action } from '@storybook/addon-actions'
import { SectionHeader } from './SectionHeader'
import { SegmentedControl } from '../SegmentedControl'

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

export const WithSegmentedControlTrailing: Story = {
  args: {
    title: '저녁 18,000원 이하',
    trailing: (
      <View style={{ width: 164 }}>
        <SegmentedControl
          options={['가격보기', '지도보기']}
          selectedIndex={0}
          onChange={action('onChange')}
        />
      </View>
    ),
  },
}
