import type { ComponentProps } from 'react'
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { ChipList } from './ChipList'

const meta: Meta<typeof ChipList> = {
  title: 'Components/ChipList',
  component: ChipList,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    label: 'Label',
    options: [
      { label: 'Text 1', value: '1' },
      { label: 'Text 2', value: '2' },
      { label: 'Text 3', value: '3' },
    ],
  },
}

export default meta

type Story = StoryObj<typeof ChipList>

const Controlled = (args: Omit<ComponentProps<typeof ChipList>, 'onChange'>) => {
  const [value, setValue] = useState(args.value)
  return <ChipList {...args} value={value} onChange={setValue} />
}

export const Default: Story = {
  render: (args) => <Controlled {...args} value="" />,
}

export const Selected: Story = {
  render: (args) => <Controlled {...args} value="1" />,
}

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <Controlled {...args} value="1" />,
}
