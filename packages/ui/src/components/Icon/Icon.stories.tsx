import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { Icon } from './Icon'

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  argTypes: {
    name: {
      control: 'select',
      options: [
        'bulb',
        'link-horizontal',
        'puzzle',
        'chevron-left',
        'chevron-down',
        'chevron-up',
        'home',
        'recommend',
        'chat',
        'record',
        'profile',
        'camera',
        'krw',
        'arrow-right',
        'swap',
        'search',
        'restaurant',
        'locate',
      ],
    },
    size: { control: 'select', options: ['xsmall', 'small', 'medium', 'large', 'xlarge'] },
  },
  args: {
    name: 'bulb',
  },
}

export default meta

type Story = StoryObj<typeof Icon>

export const Bulb: Story = {
  args: { name: 'bulb' },
}

export const LinkHorizontal: Story = {
  args: { name: 'link-horizontal' },
}

export const Puzzle: Story = {
  args: { name: 'puzzle' },
}

export const ChevronLeft: Story = {
  args: { name: 'chevron-left' },
}

export const ChevronDown: Story = {
  args: { name: 'chevron-down' },
}

export const ChevronUp: Story = {
  args: { name: 'chevron-up' },
}

export const Home: Story = {
  args: { name: 'home' },
}

export const Recommend: Story = {
  args: { name: 'recommend' },
}

export const Chat: Story = {
  args: { name: 'chat' },
}

export const Record: Story = {
  args: { name: 'record' },
}

export const Profile: Story = {
  args: { name: 'profile' },
}

export const Camera: Story = {
  args: { name: 'camera' },
}

export const Krw: Story = {
  args: { name: 'krw' },
}

export const ArrowRight: Story = {
  args: { name: 'arrow-right' },
}

export const Swap: Story = {
  args: { name: 'swap' },
}

export const Search: Story = {
  args: { name: 'search' },
}

export const Restaurant: Story = {
  args: { name: 'restaurant' },
}

export const Locate: Story = {
  args: { name: 'locate' },
}

export const AllSizes: Story = {
  render: (args) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <Icon {...args} size="xsmall" />
      <Icon {...args} size="small" />
      <Icon {...args} size="medium" />
      <Icon {...args} size="large" />
      <Icon {...args} size="xlarge" />
    </View>
  ),
}
