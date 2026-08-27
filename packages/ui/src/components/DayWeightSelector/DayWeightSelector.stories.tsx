import type { ComponentProps } from 'react'
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { DayWeightSelector } from './DayWeightSelector'
import type { DayWeightMeal, MealWeight } from './DayWeightSelector'

const initialMeals: DayWeightMeal[] = [
  { key: 'breakfast', label: '아침', amount: '12,000원', weight: '가볍게' },
  { key: 'lunch', label: '점심', amount: '15,000원', weight: '보통' },
  { key: 'dinner', label: '저녁', amount: '18,000원', weight: '든든하게' },
]

const meta: Meta<typeof DayWeightSelector> = {
  title: 'Components/DayWeightSelector',
  component: DayWeightSelector,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    title: '2일차 | 08.13',
    dayBudget: '45,000원',
    meals: initialMeals,
  },
}

export default meta

type Story = StoryObj<typeof DayWeightSelector>

// 헤더 클릭으로 펼침/접힘이 실제로 토글되는지, active일 때 Chip으로 weight를 바꿀 수
// 있는지 Storybook 캔버스에서 바로 확인할 수 있도록 상태를 들고 있는 래퍼
const Controlled = (
  args: Omit<ComponentProps<typeof DayWeightSelector>, 'onToggleExpanded' | 'onChangeWeight'>,
) => {
  const [expanded, setExpanded] = useState(args.expanded ?? false)
  const [meals, setMeals] = useState(args.meals)

  const handleChangeWeight = (mealKey: string, weight: MealWeight) => {
    setMeals((prev) => prev.map((meal) => (meal.key === mealKey ? { ...meal, weight } : meal)))
  }

  return (
    <DayWeightSelector
      {...args}
      expanded={expanded}
      meals={meals}
      onToggleExpanded={() => setExpanded((prev) => !prev)}
      onChangeWeight={handleChangeWeight}
    />
  )
}

export const CollapsedInactive: Story = {
  render: (args) => <Controlled {...args} />,
}

export const CollapsedActive: Story = {
  args: { active: true },
  render: (args) => <Controlled {...args} />,
}

export const ExpandedInactive: Story = {
  args: { expanded: true },
  render: (args) => <Controlled {...args} />,
}

export const ExpandedActive: Story = {
  args: { expanded: true, active: true },
  render: (args) => <Controlled {...args} />,
}

export const AllStates: Story = {
  render: (args) => (
    <View style={{ gap: 12 }}>
      <Controlled {...args} />
      <Controlled {...args} active />
      <Controlled {...args} expanded />
      <Controlled {...args} expanded active />
    </View>
  ),
}
