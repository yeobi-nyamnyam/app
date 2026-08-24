import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { View } from 'react-native'
import { ListRow } from './ListRow'
import { Icon } from '../Icon'

const meta: Meta<typeof ListRow> = {
  title: 'Components/ListRow',
  component: ListRow,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    backgroundColor: { control: 'radio', options: ['white', 'alpha'] },
    titleAlign: { control: 'radio', options: ['left', 'center'] },
    titleWeight: { control: 'radio', options: ['regular', 'semibold'] },
  },
  args: {
    title: 'Title',
    icon: <Icon name="bulb" />,
  },
}

export default meta

type Story = StoryObj<typeof ListRow>

export const Alpha: Story = {
  args: {
    backgroundColor: 'alpha',
  },
}

export const WhiteWithTailing: Story = {
  args: {
    backgroundColor: 'white',
    tailing: 'Tailing',
  },
}

export const WhiteCenteredSemibold: Story = {
  args: {
    backgroundColor: 'white',
    titleAlign: 'center',
    titleWeight: 'semibold',
    icon: null,
  },
}

export const IconVariants: Story = {
  render: (args) => (
    <View style={{ gap: 12 }}>
      <ListRow {...args} icon={<Icon name="bulb" />} title="Bulb" />
      <ListRow {...args} icon={<Icon name="link-horizontal" />} title="Link Horizontal" />
      <ListRow {...args} icon={<Icon name="puzzle" />} title="Puzzle" />
    </View>
  ),
}

export const Pressable: Story = {
  args: {
    onPress: action('onPress'),
  },
}
