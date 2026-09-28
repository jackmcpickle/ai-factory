import { createFormHookContexts } from "@tanstack/react-form";
import type { ChangeEvent, ReactElement } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

function fieldError(errors: readonly unknown[]): string | null {
  const [first] = errors;
  if (typeof first === "string" && first.length > 0) {
    return first;
  }
  if (
    first &&
    typeof first === "object" &&
    "message" in first &&
    typeof first.message === "string"
  ) {
    return first.message;
  }
  return null;
}

function FieldError({
  message,
}: {
  message: string | null;
}): ReactElement | null {
  if (!message) {
    return null;
  }
  return <p className="text-destructive text-xs">{message}</p>;
}

export function TextField({
  label,
  placeholder,
}: {
  label: string;
  placeholder?: string;
}): ReactElement {
  const field = useFieldContext<string>();
  const error = fieldError(field.state.meta.errors);
  const id = `field-${field.name}`;
  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    field.handleChange(event.target.value);
  }
  return (
    <label className="flex flex-col gap-1.5 text-sm" htmlFor={id}>
      <span className="font-medium">{label}</span>
      <Input
        id={id}
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={handleChange}
        aria-invalid={error ? true : undefined}
      />
      <FieldError message={error} />
    </label>
  );
}

export function TextareaField({
  label,
  placeholder,
}: {
  label: string;
  placeholder?: string;
}): ReactElement {
  const field = useFieldContext<string>();
  const error = fieldError(field.state.meta.errors);
  const id = `field-${field.name}`;
  function handleChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    field.handleChange(event.target.value);
  }
  return (
    <label className="flex flex-col gap-1.5 text-sm" htmlFor={id}>
      <span className="font-medium">{label}</span>
      <Textarea
        id={id}
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={handleChange}
        className="min-h-28"
        aria-invalid={error ? true : undefined}
      />
      <FieldError message={error} />
    </label>
  );
}

export function SelectField({
  label,
  options,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
}): ReactElement {
  const field = useFieldContext<string>();
  const error = fieldError(field.state.meta.errors);
  const id = `field-${field.name}`;
  function handleChange(event: ChangeEvent<HTMLSelectElement>): void {
    field.handleChange(event.target.value);
  }
  return (
    <label className="flex flex-col gap-1.5 text-sm" htmlFor={id}>
      <span className="font-medium">{label}</span>
      <select
        id={id}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={handleChange}
        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </label>
  );
}

export function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}): ReactElement {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? pendingLabel : label}
        </Button>
      )}
    </form.Subscribe>
  );
}
