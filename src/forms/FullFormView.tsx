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
  const { isValidating } = useFormState({ control: form.control });

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
        disabled={isSubmitting || isValidating}
        className={primaryButtonClassName}
      >
        {isSubmitting ? submittingLabel : submitLabel}
        {submitIcon}
      </button>
    </form>
  );
};
