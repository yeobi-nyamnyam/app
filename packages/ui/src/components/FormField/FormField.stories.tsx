import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { action } from '@storybook/addon-actions'
import { FormField } from './FormField'
import { TextField } from '../TextField'
import { ChipList } from '../ChipList'
import { Button } from '../Button'

const meta: Meta<typeof FormField> = {
  title: 'Components/FormField',
  component: FormField,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    label: 'Label',
  },
}

export default meta

type Story = StoryObj<typeof FormField>

const TextFieldExample = (args: { label: string }) => {
  const [value, setValue] = useState('')
  return (
    <FormField {...args}>
      <TextField value={value} onChangeText={setValue} placeholder="placeholder" />
    </FormField>
  )
}

const ChipListExample = (args: { label: string }) => {
  const [value, setValue] = useState('')
  const options = [
    { label: 'Text 1', value: '1' },
    { label: 'Text 2', value: '2' },
    { label: 'Text 3', value: '3' },
  ]
  return (
    <FormField {...args}>
      <ChipList label="Label" options={options} value={value} onChange={setValue} />
    </FormField>
  )
}

export const WithTextField: Story = {
  render: (args) => <TextFieldExample {...args} />,
}

export const WithChipList: Story = {
  render: (args) => <ChipListExample {...args} />,
}

export const WithButton: Story = {
  render: (args) => (
    <FormField {...args}>
      <Button label="text" onPress={action('onPress')} />
    </FormField>
  ),
}
