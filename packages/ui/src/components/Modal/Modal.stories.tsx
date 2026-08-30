import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { Modal } from './Modal'

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  args: {
    title: 'Title',
    content: 'Content',
    onCancel: action('onCancel'),
    onConfirm: action('onConfirm'),
  },
}

export default meta

type Story = StoryObj<typeof Modal>

export const Default: Story = {}

export const CustomLabels: Story = {
  args: {
    title: '여행을 종료할까요?',
    content: '종료하면 더 이상 기록을 추가할 수 없어요.',
    cancelLabel: '아니요',
    confirmLabel: '종료하기',
  },
}
