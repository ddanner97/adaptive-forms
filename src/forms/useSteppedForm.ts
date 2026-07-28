"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { FormConfig, FormValues } from "./types";

interface UseSteppedFormInput {
  config: FormConfig;
  form: UseFormReturn<FormValues>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onStepChange?: (current: number, total: number) => void;
}

/**
 * Headless multi-step state machine. Owns step index, per-step validation
 * gating, and submit routing; renders nothing. A view layer (Tailwind, MUI,
 * anything) consumes this and supplies the markup.
 */
export function useSteppedForm({
  config,
  form,
  onSubmit,
  onStepChange,
}: UseSteppedFormInput) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = config.steps ?? [];
  const step = steps[currentStep];
  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;
  const { trigger, setValue, getValues } = form;

  // Track the latest callback in a ref so the notify effect depends only on the
  // step values. Parents typically pass an inline arrow function, and keying the
  // effect on that ever-changing identity loops forever.
  const onStepChangeRef = useRef(onStepChange);
  useEffect(() => {
    onStepChangeRef.current = onStepChange;
  });

  useEffect(() => {
    onStepChangeRef.current?.(currentStep + 1, totalSteps);
  }, [currentStep, totalSteps]);

  const stepFields = step
    ? config.fields.filter((field) => step.fieldNames.includes(field.name))
    : [];

  async function goNext() {
    if (!step) {
      return;
    }

    const isValid = await trigger(step.fieldNames);

    if (!isValid) {
      // Mark the step's fields touched so their errors become visible under the
      // rules in errorVisibility.ts — otherwise a failed "Next" looks like a
      // dead button on fields the user has not focused yet.
      for (const fieldName of step.fieldNames) {
        setValue(fieldName, getValues(fieldName), { shouldTouch: true });
      }
      return;
    }

    setCurrentStep((value) => value + 1);
  }

  function goBack() {
    setCurrentStep((value) => Math.max(0, value - 1));
  }

  /**
   * Every step — not just the last — must render a real `type="submit"` button,
   * and every submit must route through here.
   *
   * Without a submit control in the DOM, some mobile keyboards' "Go"/"Return"
   * action falls through to submitting the form natively. That runs full-schema
   * validation including still-unmounted later-step fields, fails, and
   * permanently latches react-hook-form's `isSubmitted` — which then makes
   * stale errors visible for the rest of the session.
   */
  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLastStep) {
      void goNext();
      return;
    }

    onSubmit(event);
  }

  return {
    currentStep,
    totalSteps,
    step,
    stepFields,
    isLastStep,
    goNext,
    goBack,
    handleFormSubmit,
  };
}
