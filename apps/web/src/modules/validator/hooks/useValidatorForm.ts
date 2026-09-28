import { createFormHook } from '@tanstack/react-form'
import {
  fieldContext,
  formContext,
  SelectField,
  SubmitButton,
  TextareaField,
  TextField,
} from '@/lib/form'

const validatorForm = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, TextareaField, SelectField },
  formComponents: { SubmitButton },
})

export const useValidatorForm = validatorForm.useAppForm
