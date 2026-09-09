import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { View } from 'react-native'
import { Switch } from './Switch'

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    value: false,
    onPress: action('onPress'),
  },
}

export default meta

type Story = StoryObj<typeof Switch>

export const Off: Story = {}

export const On: Story = {
  args: { value: true },
}

export const Both: Story = {
  render: (args) => (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <Switch {...args} value={false} />
      <Switch {...args} value={true} />
    </View>
  ),
}
