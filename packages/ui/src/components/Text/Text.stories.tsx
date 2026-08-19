import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { Text, type TextColor, type TextVariant } from './Text'
import { spacing } from '../../tokens'

const meta: Meta<typeof Text> = {
  title: 'Components/Text',
  component: Text,
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'title1Bold',
        'title2Bold',
        'title3Regular',
        'title3Emphasized',
        'headlineRegular',
        'headlineEmphasized',
        'bodyRegular',
        'bodyEmphasized',
        'calloutRegular',
        'calloutEmphasized',
        'subheadlineRegular',
        'subheadlineEmphasized',
        'footnoteRegular',
        'footnoteEmphasized',
      ] satisfies TextVariant[],
    },
    color: {
      control: 'select',
      options: [
        'default',
        'subtle',
        'subtlest',
        'disabled',
        'inverse',
        'error',
        'warn',
        'success',
      ] satisfies TextColor[],
    },
  },
  args: {
    children: '텍스트입니다',
    variant: 'bodyRegular',
    color: 'default',
  },
}

export default meta

type Story = StoryObj<typeof Text>

export const Default: Story = {}

const allVariants: TextVariant[] = [
  'title1Bold',
  'title2Bold',
  'title3Regular',
  'title3Emphasized',
  'headlineRegular',
  'headlineEmphasized',
  'bodyRegular',
  'bodyEmphasized',
  'calloutRegular',
  'calloutEmphasized',
  'subheadlineRegular',
  'subheadlineEmphasized',
  'footnoteRegular',
  'footnoteEmphasized',
]

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: spacing[200] }}>
      {allVariants.map((variant) => (
        <Text key={variant} variant={variant}>
          {variant}
        </Text>
      ))}
    </View>
  ),
}

const allColors: TextColor[] = [
  'default',
  'subtle',
  'subtlest',
  'disabled',
  'error',
  'warn',
  'success',
]

export const Colors: Story = {
  render: () => (
    <View style={{ gap: spacing[200] }}>
      {allColors.map((color) => (
        <Text key={color} color={color}>
          {color}
        </Text>
      ))}
    </View>
  ),
}
