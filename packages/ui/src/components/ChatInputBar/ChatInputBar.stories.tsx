import type { ComponentProps } from 'react'
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { ChatInputBar } from './ChatInputBar'

const meta: Meta<typeof ChatInputBar> = {
  title: 'Components/ChatInputBar',
  component: ChatInputBar,
  decorators: [
    (Story) => (
      <View style={{ width: 402 }}>
        <Story />
      </View>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof ChatInputBar>

// 실제 입력 동작(타이핑)을 Storybook 캔버스에서 확인할 수 있도록 값을 로컬로 들고 있는 래퍼
const Controlled = (props: ComponentProps<typeof ChatInputBar>) => {
  const [value, setValue] = useState(props.value)
  return <ChatInputBar {...props} value={value} onChangeText={setValue} />
}

export const Default: Story = {
  render: (args) => <Controlled {...args} value="" />,
}

export const Focused: Story = {
  render: (args) => <Controlled {...args} value="여행 선물로 9만원 썼어.. ㅋ" />,
}
