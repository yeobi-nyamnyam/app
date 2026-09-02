import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { SettingRow } from './SettingRow'

const meta: Meta<typeof SettingRow> = {
  title: 'Components/SettingRow',
  component: SettingRow,
  decorators: [
    (Story) => (
      <View style={{ width: 358, padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    title: '닉네임 변경',
    subtitle: '맛있는 코끼리 · 변경 가능',
  },
}

export default meta

type Story = StoryObj<typeof SettingRow>

export const WithSubtitle: Story = {}

export const TitleOnly: Story = {
  args: { title: '로그아웃', subtitle: undefined },
}

export const Danger: Story = {
  args: { title: '회원탈퇴', subtitle: undefined, showChevron: false, variant: 'danger' },
}

export const List: Story = {
  render: () => (
    <View style={{ gap: 10 }}>
      <SettingRow title="닉네임 변경" subtitle="맛있는 코끼리 · 변경 가능" />
      <SettingRow title="로그아웃" />
      <SettingRow title="회원탈퇴" showChevron={false} variant="danger" />
    </View>
  ),
}
