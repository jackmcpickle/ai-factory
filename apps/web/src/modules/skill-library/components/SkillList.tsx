import type { ChangeEvent, ReactElement } from 'react'
import { Button } from '@/components/ui/button'
import { isZipFileName } from '@/modules/skill-library/helpers'
import { useLoadSkillMutation } from '@/modules/skill-library/hooks/useLoadSkillMutation'
import { useShareSkillMutation } from '@/modules/skill-library/hooks/useShareSkillMutation'
import { useSkillLibraryQuery } from '@/modules/skill-library/hooks/useSkillLibraryQuery'
import { useUploadSkillZipMutation } from '@/modules/skill-library/hooks/useUploadSkillZipMutation'
import type { SkillRecord } from '@/modules/skill-library/types'

export function SkillList(): ReactElement {
  const { skills, pendingZipFileName } = useSkillLibraryQuery()
  return (
    <div className="flex flex-col gap-3" data-testid="skill-library">
      <PendingZip fileName={pendingZipFileName} />
      <EmptySkillLibrary count={skills.length} pending={pendingZipFileName} />
      <ul className="flex flex-col gap-3">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </ul>
    </div>
  )
}

function PendingZip({
  fileName,
}: {
  fileName: string | null
}): ReactElement | null {
  if (!fileName) return null
  return (
    <article className="rounded-md border px-3 py-2 text-sm">
      Uploaded {fileName}
    </article>
  )
}

function EmptySkillLibrary({
  count,
  pending,
}: {
  count: number
  pending: string | null
}): ReactElement | null {
  if (count > 0 || pending) return null
  return (
    <p className="text-sm text-muted-foreground">
      No skills yet. Add one to load it into the project or share it to the org.
    </p>
  )
}

function SkillCard({ skill }: { skill: SkillRecord }): ReactElement {
  const { loadSkillMutation } = useLoadSkillMutation()
  const { shareSkillMutation } = useShareSkillMutation()
  const { uploadSkillZipMutation } = useUploadSkillZipMutation()

  function handleZip(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    if (!file || !isZipFileName(file.name)) return
    uploadSkillZipMutation({ id: skill.id, fileName: file.name })
  }

  return (
    <li className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">{skill.name}</h3>
          <p className="text-xs text-muted-foreground">{skill.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={skill.loaded}
            onClick={() => loadSkillMutation(skill.id)}
          >
            {skill.loaded ? 'Loaded into project' : 'Load into project'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={skill.shared}
            onClick={() => shareSkillMutation(skill.id)}
          >
            {skill.shared ? 'Shared to org' : 'Share to org'}
          </Button>
        </div>
      </div>
      <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-md bg-muted px-3 py-2 text-xs">
        {skill.skill}
      </pre>
      <OtherFiles files={skill.otherFiles} />
      <ZipName fileName={skill.zipFileName} />
      <label className="text-xs text-muted-foreground">
        Replace zip
        <input
          type="file"
          accept=".zip,application/zip"
          aria-label={`Upload zip for ${skill.name}`}
          className="mt-1 block text-xs"
          onChange={handleZip}
        />
      </label>
    </li>
  )
}

function OtherFiles({
  files,
}: {
  files: SkillRecord['otherFiles']
}): ReactElement | null {
  if (files.length === 0) return null
  return (
    <ul className="text-xs text-muted-foreground">
      {files.map((file) => (
        <li key={file.name}>{file.name}</li>
      ))}
    </ul>
  )
}

function ZipName({
  fileName,
}: {
  fileName: string | null
}): ReactElement | null {
  if (!fileName) return null
  return <p className="text-xs">Uploaded {fileName}</p>
}
