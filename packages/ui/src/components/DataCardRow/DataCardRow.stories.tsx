import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { DataCardRow } from './DataCardRow'

const meta: Meta<typeof DataCardRow> = {
  title: 'Components/DataCardRow',
  component: DataCardRow,
  decorators: [
    (Story) => (
      <View style={{ padding: 16, width: 336 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    variant: { control: 'radio', options: ['info', 'menu'] },
  },
  args: {
    label: 'Label',
    value: 'Value',
    cuisine: 'Cuisine',
    price: '0원',
  },
}

export default meta

type Story = StoryObj<typeof DataCardRow>

export const Info: Story = {}

export const Menu: Story = {
  args: { variant: 'menu' },
}

export const MenuWithoutPrice: Story = {
  args: { variant: 'menu', showPrice: false },
}

export const AllVariants: Story = {
  render: (args) => (
    <View>
      <DataCardRow {...args} variant="info" label="주소" value="서울 강남구 테헤란로 123" />
      <DataCardRow {...args} variant="info" label="영업시간" value="10:00 - 22:00" />
      <DataCardRow {...args} variant="menu" cuisine="제육볶음" price="9,000원" />
      <DataCardRow {...args} variant="menu" cuisine="된장찌개" price="8,000원" />
    </View>
  ),
}
