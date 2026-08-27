import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { BadgeCard } from './BadgeCard'
import { badgeNames } from '../../assets/badges'
import type { BadgeId } from '../../assets/badges'

const badgeIds: BadgeId[] = [
  'budget-completer',
  'n-travel-completed',
  'ai-first-chat',
  'redesign-master',
  'crisis-escape',
  'value-hunter',
  'daily-record-king',
  'first-trip-planner',
  'flex-traveler',
  'nationwide-gourmet',
  'good-price',
  'consistent-type',
  'frugal-expert',
  'local-crew',
  'early-bird-saver',
  'quick-reflexes-master',
  'perfect-fit-planner',
]

const meta: Meta<typeof BadgeCard> = {
  title: 'Components/BadgeCard',
  component: BadgeCard,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    badgeId: { control: 'select', options: badgeIds },
  },
  args: {
    title: 'Title',
    point: '+0pt',
  },
}

export default meta

type Story = StoryObj<typeof BadgeCard>

export const Locked: Story = {}

export const Earned: Story = {
  args: { title: badgeNames['nationwide-gourmet'], point: '+10pt', badgeId: 'nationwide-gourmet' },
}

export const AllBadges: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {badgeIds.map((badgeId) => (
        <BadgeCard key={badgeId} title={badgeNames[badgeId]} point="+10pt" badgeId={badgeId} />
      ))}
    </View>
  ),
}
