import { createFormHook } from "@tanstack/react-form";

import {
  fieldContext,
  formContext,
  SelectField,
  SubmitButton,
  TextareaField,
  TextField,
} from "@/lib/form";

const ruleForm = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, TextareaField, SelectField },
  formComponents: { SubmitButton },
});

export const useRuleForm = ruleForm.useAppForm;
