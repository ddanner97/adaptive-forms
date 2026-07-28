"use client";

import type React from "react";
import type { ReactNode } from "react";
import { useFormState, type UseFormReturn } from "react-hook-form";
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "../fields/styles";
import { FormField } from "./FormField";
import { useSteppedForm } from "./useSteppedForm";
import type { FieldRegistry, FormLayout, FormValues } from "./types";

interface SteppedFormViewProps {
  config: FormLayout;
  registry: FieldRegistry;
  form: UseFormReturn<FormValues>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  submitLabel?: string;
  submittingLabel?: string;
  nextLabel?: string;
  backLabel?: string;
  isSubmitting?: boolean;
  onStepChange?: (current: number, total: number) => void;
  /** Optional trailing icon on the primary button; keeps the library icon-agnostic. */
  submitIcon?: ReactNode;
}

/** Mobile stepped wizard; validates one step at a time before advancing. */
export const SteppedFormView = ({
  config,
  registry,
  form,
  onSubmit,
  submitLabel = "Submit",
  submittingLabel = "Submitting...",
  nextLabel = "Next",
  backLabel = "Back",
  isSubmitting = false,
  onStepChange,
  submitIcon,
}: SteppedFormViewProps) => {
  const { isValidating } = useFormState({ control: form.control });
  const {
    currentStep,
    totalSteps,
    step,
    stepFields,
    isLastStep,
    goBack,
    handleFormSubmit,
  } = useSteppedForm({ config, form, onSubmit, onStepChange });

  if (!step) {
    return null;
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      {/* When a parent observes steps via onStepChange it owns the step
          indicator, so skip the inline one to avoid showing two. */}
      {!onStepChange ? (
        <p className="text-sm text-[var(--af-muted)]">
          Step {currentStep + 1} of {totalSteps}
        </p>
      ) : null}

      {step.title ? (
        <h2 className="text-center font-[family-name:var(--af-font-display)] text-2xl font-semibold text-[var(--af-foreground)]">
          {step.title}
        </h2>
      ) : null}

      {stepFields.map((field) => (
        <FormField
          key={field.name}
          config={field}
          form={form}
          registry={registry}
        />
      ))}

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={isSubmitting || isValidating}
          className={primaryButtonClassName}
        >
          {isLastStep ? (isSubmitting ? submittingLabel : submitLabel) : nextLabel}
          {submitIcon}
        </button>

        {currentStep > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className={secondaryButtonClassName}
          >
            {backLabel}
          </button>
        ) : null}
      </div>
    </form>
  );
};
