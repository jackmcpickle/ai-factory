import { useId, useState } from "react";
import type { ChangeEvent, FormEvent, ReactElement } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isZipFileName } from "@/modules/skill-library/helpers";
import { useCreateSkillMutation } from "@/modules/skill-library/hooks/useCreateSkillMutation";
import { useSkillForm } from "@/modules/skill-library/hooks/useSkillForm";
import { useUploadSkillZipMutation } from "@/modules/skill-library/hooks/useUploadSkillZipMutation";
import { skillDraftSchema } from "@/modules/skill-library/schemas/skill.schema";
import type { SkillDraft } from "@/modules/skill-library/types";

function emptySkillDraft(): SkillDraft {
  return {
    name: "",
    description: "",
    skill: "",
    otherFiles: [],
    zipFileName: null,
  };
}

export function SkillForm(): ReactElement {
  const { createSkillMutationAsync } = useCreateSkillMutation();
  const { uploadSkillZipMutation } = useUploadSkillZipMutation();
  const [zipError, setZipError] = useState<string | null>(null);
  const otherFileIdPrefix = useId();
  const form = useSkillForm({
    defaultValues: emptySkillDraft(),
    validators: {
      onSubmit: skillDraftSchema,
    },
    onSubmit: async ({ value }) => {
      await createSkillMutationAsync(value);
      setZipError(null);
      form.reset();
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    event.stopPropagation();
    void form.handleSubmit();
  }

  function handleZip(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!isZipFileName(file.name)) {
      setZipError("Choose a .zip file");
      form.setFieldValue("zipFileName", null);
      uploadSkillZipMutation({ fileName: file.name });
      return;
    }
    setZipError(null);
    form.setFieldValue("zipFileName", file.name);
    uploadSkillZipMutation({ fileName: file.name });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      data-testid="skill-form"
    >
      <form.AppField name="name">
        {(field) => (
          <field.TextField label="Name" placeholder="Review helper" />
        )}
      </form.AppField>
      <form.AppField name="description">
        {(field) => (
          <field.TextareaField
            label="Description"
            placeholder="What this skill is for"
          />
        )}
      </form.AppField>
      <form.AppField name="skill">
        {(field) => (
          <field.TextareaField
            label="Skill"
            placeholder="The main skill file"
          />
        )}
      </form.AppField>
      <form.Field name="otherFiles" mode="array">
        {(field) => (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Other files</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => field.pushValue({ name: "", contents: "" })}
              >
                Add file
              </Button>
            </div>
            {field.state.value.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex flex-col gap-2 rounded-md border p-3"
              >
                <label
                  htmlFor={`${otherFileIdPrefix}-${index}-name`}
                  className="flex flex-col gap-1 text-sm"
                >
                  File name
                  <Input
                    id={`${otherFileIdPrefix}-${index}-name`}
                    value={file.name}
                    aria-label={`Other file ${index + 1} name`}
                    onChange={(event) => {
                      const next = [...field.state.value];
                      const current = next[index];
                      next[index] = { ...current, name: event.target.value };
                      field.setValue(next);
                    }}
                  />
                </label>
                <label
                  htmlFor={`${otherFileIdPrefix}-${index}-contents`}
                  className="flex flex-col gap-1 text-sm"
                >
                  Contents
                  <Textarea
                    id={`${otherFileIdPrefix}-${index}-contents`}
                    value={file.contents}
                    aria-label={`Other file ${index + 1} contents`}
                    onChange={(event) => {
                      const next = [...field.state.value];
                      const current = next[index];
                      next[index] = {
                        ...current,
                        contents: event.target.value,
                      };
                      field.setValue(next);
                    }}
                  />
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => field.removeValue(index)}
                >
                  Remove file
                </Button>
              </div>
            ))}
          </div>
        )}
      </form.Field>
      <div className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Upload skill zip</span>
        <input
          type="file"
          accept=".zip,application/zip"
          aria-label="Upload skill zip"
          onChange={handleZip}
        />
        <form.Subscribe selector={(state) => state.values.zipFileName}>
          {(zipFileName) => <ZipStatus fileName={zipFileName} />}
        </form.Subscribe>
        <ZipError message={zipError} />
        <p className="text-muted-foreground text-xs leading-relaxed">
          The file stays in this page. It is not sent anywhere.
        </p>
      </div>
      <form.AppForm>
        <form.SubmitButton label="Add skill" pendingLabel="Adding..." />
      </form.AppForm>
    </form>
  );
}

function ZipStatus({
  fileName,
}: {
  fileName: string | null;
}): ReactElement | null {
  if (!fileName) {
    return null;
  }
  return (
    <p className="text-foreground text-xs" data-testid="zip-uploaded">
      Uploaded {fileName}
    </p>
  );
}

function ZipError({
  message,
}: {
  message: string | null;
}): ReactElement | null {
  if (!message) {
    return null;
  }
  return <p className="text-destructive text-xs">{message}</p>;
}
