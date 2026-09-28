import { useState } from 'react'
import type { FormEvent, ReactElement } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { APP_PART_OPTIONS } from '@/lib/app-part'
import { addKeyword, removeKeyword } from '@/modules/validator/helpers'
import { useRunValidationMutation } from '@/modules/validator/hooks/useRunValidationMutation'
import { useValidatorForm } from '@/modules/validator/hooks/useValidatorForm'
import { validatorDraftSchema } from '@/modules/validator/schemas/validator.schema'
import type { ValidatorDraft } from '@/modules/validator/types'

function emptyDraft(): ValidatorDraft {
  return {
    instructions: '',
    target: 'frontend',
    featureName: '',
    keywords: [],
  }
}

export function ValidatorForm(): ReactElement {
  const { runValidationMutationAsync } = useRunValidationMutation()
  const [keyword, setKeyword] = useState('')
  const form = useValidatorForm({
    defaultValues: emptyDraft(),
    validators: {
      onSubmit: validatorDraftSchema,
    },
    onSubmit: async ({ value }) => {
      await runValidationMutationAsync(value)
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
      data-testid="validator-form"
    >
      <form.AppField name="instructions">
        {(field) => (
          <field.TextareaField
            label="Instructions"
            placeholder="What should this review look for?"
          />
        )}
      </form.AppField>
      <form.AppField name="target">
        {(field) => (
          <field.SelectField label="Target" options={APP_PART_OPTIONS} />
        )}
      </form.AppField>
      <form.AppField name="featureName">
        {(field) => (
          <field.TextField
            label="Feature"
            placeholder="Short feature name, when the target is Feature"
          />
        )}
      </form.AppField>
      <form.Field name="keywords">
        {(field) => {
          const error = keywordFieldError(field.state.meta.errors)
          return (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Keywords</span>
              <KeywordChips
                keywords={field.state.value}
                onRemove={(item) =>
                  field.setValue(removeKeyword(field.state.value, item))
                }
              />
              <div className="flex gap-2">
                <Input
                  aria-label="Keyword"
                  aria-invalid={error !== null}
                  value={keyword}
                  placeholder="Add a keyword"
                  onChange={(event) => setKeyword(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    field.setValue(addKeyword(field.state.value, keyword))
                    setKeyword('')
                  }}
                >
                  Add
                </Button>
              </div>
              {error ? (
                <p className="text-xs text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
          )
        }}
      </form.Field>
      <form.AppForm>
        <form.SubmitButton label="Run validation" pendingLabel="Running..." />
      </form.AppForm>
    </form>
  )
}

function keywordFieldError(errors: ReadonlyArray<unknown>): string | null {
  const first = errors[0]
  if (typeof first === 'string' && first.length > 0) return first
  if (
    first &&
    typeof first === 'object' &&
    'message' in first &&
    typeof first.message === 'string' &&
    first.message.length > 0
  ) {
    return first.message
  }
  return null
}

function KeywordChips({
  keywords,
  onRemove,
}: {
  keywords: readonly string[]
  onRemove: (keyword: string) => void
}): ReactElement | null {
  if (keywords.length === 0) return null
  return (
    <ul className="flex flex-wrap gap-2">
      {keywords.map((keyword) => (
        <li key={keyword}>
          <button
            type="button"
            className="rounded-full border px-2 py-1 text-xs"
            onClick={() => onRemove(keyword)}
          >
            {keyword} ×
          </button>
        </li>
      ))}
    </ul>
  )
}
