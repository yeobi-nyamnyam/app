import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { View } from 'react-native'
import { CheckBox } from './CheckBox'

const meta: Meta<typeof CheckBox> = {
  title: 'Components/CheckBox',
  component: CheckBox,
  args: {
    checked: false,
    onPress: action('onPress'),
  },
}

export default meta

type Story = StoryObj<typeof CheckBox>

export const Unchecked: Story = {}

export const Checked: Story = {
  args: { checked: true },
}

export const Both: Story = {
  render: (args) => (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <CheckBox {...args} checked={false} />
      <CheckBox {...args} checked={true} />
    </View>
  ),
}
