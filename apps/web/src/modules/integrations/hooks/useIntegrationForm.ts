import { createFormHook } from '@tanstack/react-form'
import { fieldContext, formContext, SubmitButton, TextField } from '@/lib/form'

const integrationForm = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField },
  formComponents: { SubmitButton },
})

export const useIntegrationForm = integrationForm.useAppForm
