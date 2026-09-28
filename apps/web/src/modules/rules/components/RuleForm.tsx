import type { FormEvent, ReactElement } from 'react'
import { APP_PART_OPTIONS } from '@/lib/app-part'
import { RULE_MODE_OPTIONS } from '@/modules/rules/constants'
import { useAddRuleMutation } from '@/modules/rules/hooks/useRuleMutations'
import { useRuleForm } from '@/modules/rules/hooks/useRuleForm'
import { ruleDraftSchema } from '@/modules/rules/schemas/rule.schema'
import type { RuleDraft } from '@/modules/rules/types'

function emptyDraft(): RuleDraft {
  return {
    name: '',
    check: '',
    mode: 'hold',
    target: 'frontend',
    featureName: '',
  }
}

export function RuleForm(): ReactElement {
  const { addRuleMutationAsync } = useAddRuleMutation()
  const form = useRuleForm({
    defaultValues: emptyDraft(),
    validators: {
      onSubmit: ruleDraftSchema,
    },
    onSubmit: async ({ value }) => {
      await addRuleMutationAsync(value)
      form.reset()
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    event.stopPropagation()
    void form.handleSubmit()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      data-testid="rule-form"
    >
      <form.AppField name="name">
        {(field) => (
          <field.TextField label="Name" placeholder="limit-discounts" />
        )}
      </form.AppField>
      <form.AppField name="check">
        {(field) => (
          <field.TextareaField
            label="Check"
            placeholder="Describe what should hold, in plain language"
          />
        )}
      </form.AppField>
      <form.AppField name="mode">
        {(field) => (
          <field.SelectField label="Expectation" options={RULE_MODE_OPTIONS} />
        )}
      </form.AppField>
      <form.AppField name="target">
        {(field) => (
          <field.SelectField
            label="Part of the app"
            options={APP_PART_OPTIONS}
          />
        )}
      </form.AppField>
      <form.AppField name="featureName">
        {(field) => (
          <field.TextField
            label="Feature"
            placeholder="Short feature name, when the part is Feature"
          />
        )}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton label="Add rule" pendingLabel="Adding..." />
      </form.AppForm>
    </form>
  )
}
