import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { RestaurantCard } from './RestaurantCard'

const meta: Meta<typeof RestaurantCard> = {
  title: 'Components/RestaurantCard',
  component: RestaurantCard,
  args: {
    name: '범물본가국수 팔달시장점',
    price: '6,000원',
    address: '대구광역시 북구 팔달로 135 1층',
    category: '한식',
    budgetLabel: '예산 0%',
    onPress: action('onPress'),
  },
}

export default meta

type Story = StoryObj<typeof RestaurantCard>

export const Default: Story = {}

export const LongName: Story = {
  args: {
    name: '아주 아주 아주 긴 식당 이름 테스트용 텍스트',
    address: '아주 아주 아주 긴 주소 테스트용 텍스트가 들어가는 경우',
  },
}
