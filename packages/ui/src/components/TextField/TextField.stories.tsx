import type { ComponentProps } from 'react'
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { TextField } from './TextField'
import { Icon } from '../Icon'

const meta: Meta<typeof TextField> = {
  title: 'Components/TextField',
  component: TextField,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    placeholder: 'placeholder',
  },
}

export default meta

type Story = StoryObj<typeof TextField>

// 실제 입력 동작(포커스/타이핑)을 Storybook 캔버스에서 확인할 수 있도록 값을 로컬로 들고 있는 래퍼
const Controlled = (props: ComponentProps<typeof TextField>) => {
  const [value, setValue] = useState(props.value)
  return <TextField {...props} value={value} onChangeText={setValue} />
}

export const Default: Story = {
  render: (args) => <Controlled {...args} value="" />,
}

export const Filled: Story = {
  render: (args) => <Controlled {...args} value="Value" />,
}

export const Error: Story = {
  args: { error: '이미 사용 중인 이메일이에요' },
  render: (args) => <Controlled {...args} value="Value" />,
}

export const ErrorHiddenMessage: Story = {
  args: { error: '이미 사용 중인 이메일이에요', hideErrorMessage: true },
  render: (args) => <Controlled {...args} value="Value" />,
}

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <Controlled {...args} value="Value" />,
}

export const WithIcons: Story = {
  render: (args) => (
    <Controlled
      {...args}
      value=""
      leadingIcon={<Icon name="chat" />}
      tailingIcon={<Icon name="bulb" />}
    />
  ),
}

export const AllStates: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Controlled placeholder="placeholder" value="" onChangeText={() => {}} />
      <Controlled placeholder="placeholder" value="Value" onChangeText={() => {}} />
      <TextField placeholder="placeholder" value="Value" error="에러 메시지" onChangeText={() => {}} />
      <TextField placeholder="placeholder" value="Value" disabled onChangeText={() => {}} />
    </View>
  ),
}
