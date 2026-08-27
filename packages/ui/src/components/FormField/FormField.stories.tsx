import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { action } from '@storybook/addon-actions'
import { FormField } from './FormField'
import { TextField } from '../TextField'
import { Chip } from '../Chip'
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
  const [selected, setSelected] = useState('Text 1')
  const options = ['Text 1', 'Text 2', 'Text 3']
  return (
    <FormField {...args}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {options.map((text) => (
          <Chip
            key={text}
            text={text}
            width="fill"
            active={selected === text}
            onPress={() => setSelected(text)}
          />
        ))}
      </View>
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
