import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { Button } from './Button'
import { colors, radius } from '../../tokens'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: { control: 'radio', options: ['primary', 'outline'] },
  },
  args: {
    label: 'text',
    variant: 'primary',
    disabled: false,
  },
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {}

export const Outline: Story = {
  args: { variant: 'outline' },
}

export const PrimaryDisabled: Story = {
  args: { disabled: true },
}

export const OutlineDisabled: Story = {
  args: { variant: 'outline', disabled: true },
}

export const PrimaryWithIcon: Story = {
  args: {
    icon: (
      <View
        style={{
          flex: 1,
          borderRadius: radius.full,
          backgroundColor: colors.content.neutral.inverse,
        }}
      />
    ),
  },
}
