"use client";

import type React from "react";
import type { ReactNode } from "react";
import { useFormState, type UseFormReturn } from "react-hook-form";
import { primaryButtonClassName } from "../fields/styles";
import { FormField } from "./FormField";
import type { FieldRegistry, FormLayout, FormValues } from "./types";

interface FullFormViewProps {
  config: FormLayout;
  registry: FieldRegistry;
  form: UseFormReturn<FormValues>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  submitLabel?: string;
  submittingLabel?: string;
  isSubmitting?: boolean;
  submitIcon?: ReactNode;
}

/** Single-page form that renders every configured field at once. */
export const FullFormView = ({
  config,
  registry,
  form,
  onSubmit,
  submitLabel = "Submit",
  submittingLabel = "Submitting...",
  isSubmitting = false,
  submitIcon,
}: FullFormViewProps) => {
  // Combine the caller's flag with react-hook-form's own submission state, so
  // an async onSubmit is locked against double-submit even when the consumer
  // forgets to thread `isSubmitting` back in.
  const { isValidating, isSubmitting: isFormSubmitting } = useFormState({
    control: form.control,
  });
  const busy = isSubmitting || isFormSubmitting;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {config.fields.map((field) => (
        <FormField
          key={field.name}
          config={field}
          form={form}
          registry={registry}
        />
      ))}

      <button
        type="submit"
        disabled={busy || isValidating}
        className={primaryButtonClassName}
      >
        {busy ? submittingLabel : submitLabel}
        {submitIcon}
      </button>
    </form>
  );
};
