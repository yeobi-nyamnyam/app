import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { action } from '@storybook/addon-actions'
import { colors } from '@repo/tokens'
import { FloatingButton } from './FloatingButton'

const meta: Meta<typeof FloatingButton> = {
  title: 'Components/FloatingButton',
  component: FloatingButton,
  args: {
    onPress: action('onPress'),
  },
  decorators: [
    (Story) => (
      <View
        style={{
          padding: 40,
          alignItems: 'flex-start',
          backgroundColor: colors.surface.primary.default,
        }}
      >
        <Story />
      </View>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof FloatingButton>

export const Default: Story = {}
