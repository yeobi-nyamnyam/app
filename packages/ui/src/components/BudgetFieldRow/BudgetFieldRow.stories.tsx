import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { View } from 'react-native'
import { BudgetFieldRow } from './BudgetFieldRow'

const meta: Meta<typeof BudgetFieldRow> = {
  title: 'Components/BudgetFieldRow',
  component: BudgetFieldRow,
  decorators: [
    (Story) => (
      <View style={{ padding: 16, width: 342 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    state: { control: 'radio', options: ['default', 'edited'] },
  },
  args: {
    label: 'Field',
    value: 'Value',
  },
}

export default meta

type Story = StoryObj<typeof BudgetFieldRow>

export const Default: Story = {}

export const Edited: Story = {
  args: { state: 'edited' },
}

export const AllStates: Story = {
  render: (args) => (
    <View>
      <BudgetFieldRow {...args} label="고정비" value="300,000원" />
      <BudgetFieldRow {...args} label="식비" value="200,000원" state="edited" />
    </View>
  ),
}

export const EditPressable: Story = {
  args: {
    label: '고정비',
    value: '300,000원',
    onEditPress: action('onEditPress'),
  },
}
