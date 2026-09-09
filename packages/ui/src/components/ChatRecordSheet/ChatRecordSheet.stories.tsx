import type { ComponentProps } from 'react'
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { action } from '@storybook/addon-actions'
import { ChatRecordSheet } from './ChatRecordSheet'

const categories = [
  { label: '기타', value: 'etc' },
  { label: '교통', value: 'transport' },
  { label: '숙소', value: 'stay' },
  { label: '기념품', value: 'souvenir' },
]

const meta: Meta<typeof ChatRecordSheet> = {
  title: 'Components/ChatRecordSheet',
  component: ChatRecordSheet,
  decorators: [
    (Story) => (
      <View style={{ width: 402 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    title: '끼니 기록',
    categories,
    onTitlePress: action('onTitlePress'),
    onSubmit: action('onSubmit'),
  },
}

export default meta

type Story = StoryObj<typeof ChatRecordSheet>

// 카테고리 선택/금액 입력 동작을 Storybook 캔버스에서 확인할 수 있도록 값을 로컬로 들고 있는 래퍼
const Controlled = (props: ComponentProps<typeof ChatRecordSheet>) => {
  const [selectedCategory, setSelectedCategory] = useState(props.selectedCategory)
  const [amount, setAmount] = useState(props.amount)
  return (
    <ChatRecordSheet
      {...props}
      selectedCategory={selectedCategory}
      onSelectCategory={setSelectedCategory}
      amount={amount}
      onChangeAmount={setAmount}
    />
  )
}

export const Default: Story = {
  render: (args) => <Controlled {...args} selectedCategory="souvenir" amount="8,000" />,
}
