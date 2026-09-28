import type { ReactElement } from 'react'
import { EditorPage } from '@/components/editor-frame'
import { ValidationResultList } from '@/modules/validator/components/ValidationResultList'
import { ValidatorForm } from '@/modules/validator/components/ValidatorForm'

export function ValidatorView(): ReactElement {
  return (
    <EditorPage
      title="Validator"
      lede="Write what to validate, pick a part of the app, and add keywords. Running a validation only updates the result on this page."
    >
      <ValidatorForm />
      <ValidationResultList />
    </EditorPage>
  )
}
