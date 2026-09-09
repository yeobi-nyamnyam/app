import type { ComponentProps } from 'react'
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { DropdownField } from './DropdownField'

const meta: Meta<typeof DropdownField> = {
  title: 'Components/DropdownField',
  component: DropdownField,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    placeholder: '끼니를 선택하세요',
    options: [
      { label: '아침', value: 'breakfast' },
      { label: '점심', value: 'lunch' },
      { label: '저녁', value: 'dinner' },
    ],
  },
}

export default meta

type Story = StoryObj<typeof DropdownField>

// 실제 펼침/선택 동작을 Storybook 캔버스에서 확인할 수 있도록 값을 로컬로 들고 있는 래퍼
const Controlled = (props: ComponentProps<typeof DropdownField>) => {
  const [value, setValue] = useState(props.value)
  return <DropdownField {...props} value={value} onChange={setValue} />
}

export const Default: Story = {
  render: (args) => <Controlled {...args} value="" />,
}

export const Selected: Story = {
  render: (args) => <Controlled {...args} value="lunch" />,
}

export const HideSelectedInMenu: Story = {
  args: { hideSelectedInMenu: true },
  render: (args) => <Controlled {...args} value="lunch" />,
}

export const Disabled: Story = {
  args: {
    options: [{ label: '가평 당일치기', value: '1' }],
    disabled: true,
  },
  render: (args) => <Controlled {...args} value="1" />,
}
