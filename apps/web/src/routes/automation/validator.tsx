import { createFileRoute } from '@tanstack/react-router'
import { ValidatorView } from '@/modules/validator'

export const Route = createFileRoute('/automation/validator')({
  head: () => ({ meta: [{ title: 'Validator · Qantas AI' }] }),
  component: ValidatorView,
})
