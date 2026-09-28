import type { ReactElement } from 'react'
import { EditorPage } from '@/components/editor-frame'
import { SkillForm } from '@/modules/skill-library/components/SkillForm'
import { SkillList } from '@/modules/skill-library/components/SkillList'

export function SkillLibraryView(): ReactElement {
  return (
    <EditorPage
      title="Skill library"
      lede="Add a skill, load it into the project, or share it to the org. Zip files are chosen in the browser and stay on this page."
    >
      <SkillForm />
      <SkillList />
    </EditorPage>
  )
}
