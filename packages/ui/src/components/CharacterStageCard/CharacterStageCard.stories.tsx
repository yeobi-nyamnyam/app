import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { CharacterStageCard } from './CharacterStageCard'

const STAGES = [
  { stage: 1 as const, levelRangeLabel: 'Lv1~2', label: '새싹' },
  { stage: 2 as const, levelRangeLabel: 'Lv3~4', label: '여행자' },
  { stage: 3 as const, levelRangeLabel: 'Lv5~6', label: '배부른 여행자' },
  { stage: 4 as const, levelRangeLabel: 'Lv7~9', label: '미식 탐험가' },
  { stage: 5 as const, levelRangeLabel: 'Lv10+', label: '예산 마스터' },
]

const meta: Meta<typeof CharacterStageCard> = {
  title: 'Components/Character/StageCard',
  component: CharacterStageCard,
  argTypes: {
    stage: { control: 'select', options: [1, 2, 3, 4, 5] },
  },
  args: {
    stage: 1,
    levelRangeLabel: 'Lv1~2',
    label: '새싹',
  },
  decorators: [
    (Story) => (
      <View style={{ width: 90, padding: 16 }}>
        <Story />
      </View>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof CharacterStageCard>

export const Inactive: Story = {}

export const Active: Story = {
  args: { stage: 2, levelRangeLabel: 'Lv3~4', label: '여행자', active: true },
}

// 5단계 모두 아이콘 뒤 원형 배경이 빠짐없이 보이는지, 현재 단계 하이라이트가
// 나머지와 뚜렷이 구분되는지 한눈에 검증하기 위한 스토리 — 이 화면(캐릭터
// 성장, Figma node 406:2158)에서 새싹 단계만 원형 배경이 빠졌던 실수가
// 이런 종류의 스토리 없이는 눈에 띄지 않았다.
export const StageRow: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 8, width: 358, padding: 16 }}>
      {STAGES.map((item) => (
        <CharacterStageCard key={item.stage} {...item} active={item.stage === 2} />
      ))}
    </View>
  ),
}
