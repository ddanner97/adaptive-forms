"use client";

import { useForm, type UseFormReturn } from "react-hook-form";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { FullFormView } from "./FullFormView";
import { SteppedFormView } from "./SteppedFormView";
import type { FormProps, FormValues } from "./types";

/**
 * Renders a stepped wizard on mobile and a single-page form on desktop, from
 * one config. Requires `config.steps`.
 */
export const AdaptiveForm = ({
  config,
  registry,
  onSubmit,
  submitLabel,
  submittingLabel,
  isSubmitting,
  defaultValues,
  onStepChange,
}: FormProps) => {
  const { isDesktop } = useBreakpoint();
  const form = useForm<FormValues>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues,
    resolver: config.resolver,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data, { reset: () => form.reset() });
  });

  if (!config.steps?.length) {
    throw new Error(
      "AdaptiveForm requires config.steps. For a single-page form, use FullForm.",
    );
  }

  const viewProps = {
    config,
    registry,
    form: form as UseFormReturn<FormValues>,
    onSubmit: handleSubmit,
    submitLabel,
    submittingLabel,
    isSubmitting,
  };

  return isDesktop ? (
    <FullFormView {...viewProps} />
  ) : (
    <SteppedFormView {...viewProps} onStepChange={onStepChange} />
  );
};
