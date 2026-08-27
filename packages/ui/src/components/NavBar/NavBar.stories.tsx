import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { NavBar } from './NavBar'

const meta: Meta<typeof NavBar> = {
  title: 'Components/NavBar',
  component: NavBar,
  decorators: [
    (Story) => (
      <View style={{ width: 402 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    active: { control: 'select', options: ['home', 'recommend', 'chat', 'record', 'profile'] },
  },
  args: {
    active: 'home',
  },
}

export default meta

type Story = StoryObj<typeof NavBar>

export const Home: Story = {}

export const Recommend: Story = {
  args: { active: 'recommend' },
}

export const Chat: Story = {
  args: { active: 'chat' },
}

export const Record: Story = {
  args: { active: 'record' },
}

export const Profile: Story = {
  args: { active: 'profile' },
}
