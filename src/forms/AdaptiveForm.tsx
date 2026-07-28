"use client";

import {
  useForm,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { FullFormView } from "./FullFormView";
import { SteppedFormView } from "./SteppedFormView";
import type { FormProps, FormValues } from "./types";

/**
 * Renders a stepped wizard on mobile and a single-page form on desktop, from
 * one config. Requires `config.steps`.
 */
export const AdaptiveForm = <TValues extends FieldValues = FieldValues>({
  config,
  registry,
  onSubmit,
  submitLabel,
  submittingLabel,
  isSubmitting,
  defaultValues,
  onStepChange,
}: FormProps<TValues>) => {
  const { isDesktop } = useBreakpoint();
  // The engine works on an open record because fields are dynamic; the resolver
  // is typed by the caller's schema. This is the one place those two views of
  // the same data are reconciled, so consumers never have to cast.
  const form = useForm<FormValues>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues,
    resolver: config.resolver as unknown as Resolver<FormValues>,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data as unknown as TValues, { reset: () => form.reset() });
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
