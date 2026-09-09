import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { Text, type TextColor, type TextVariant } from './Text'
import { spacing } from '@repo/tokens'

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
    align: { control: 'radio', options: ['left', 'center'] },
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
    <View style={{ gap: spacing[8] }}>
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
    <View style={{ gap: spacing[8] }}>
      {allColors.map((color) => (
        <Text key={color} color={color}>
          {color}
        </Text>
      ))}
    </View>
  ),
}

export const AlignLeft: Story = {
  args: {
    align: 'left',
    children: '여러 줄로 자연스럽게 줄바꿈되는 안내 문구입니다. 왼쪽 정렬 예시입니다.',
  },
  decorators: [
    (Story) => (
      <View style={{ width: 320 }}>
        <Story />
      </View>
    ),
  ],
}

export const AlignCenter: Story = {
  args: {
    align: 'center',
    children: '여러 줄로 자연스럽게 줄바꿈되는 안내 문구입니다. 가운데 정렬 예시입니다.',
  },
  decorators: [
    (Story) => (
      <View style={{ width: 320 }}>
        <Story />
      </View>
    ),
  ],
}
