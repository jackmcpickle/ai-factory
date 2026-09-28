import { createFormHook } from '@tanstack/react-form'
import {
  fieldContext,
  formContext,
  SubmitButton,
  TextareaField,
  TextField,
} from '@/lib/form'

const skillForm = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, TextareaField },
  formComponents: { SubmitButton },
})

export const useSkillForm = skillForm.useAppForm
