import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { Character } from './Character'

const meta: Meta<typeof Character> = {
  title: 'Components/Character',
  component: Character,
  argTypes: {
    variant: { control: 'select', options: ['apricot', 'aqua', 'sky', 'slate', 'coral'] },
  },
  args: {
    variant: 'apricot',
  },
}

export default meta

type Story = StoryObj<typeof Character>

export const Apricot: Story = {
  args: { variant: 'apricot' },
}

export const Aqua: Story = {
  args: { variant: 'aqua' },
}

export const Sky: Story = {
  args: { variant: 'sky' },
}

export const Slate: Story = {
  args: { variant: 'slate' },
}

export const Coral: Story = {
  args: { variant: 'coral' },
}

export const AllVariants: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <Character variant="apricot" />
      <Character variant="aqua" />
      <Character variant="sky" />
      <Character variant="slate" />
      <Character variant="coral" />
    </View>
  ),
}

export const WithShadow: Story = {
  args: {
    variant: 'coral',
    shadow: { offsetY: 4, blur: 3.25, opacity: 0.25 },
  },
}

export const WithLayerBlur: Story = {
  args: {
    variant: 'apricot',
    blur: 1.15,
  },
}
