"use client";

import { useForm, type UseFormReturn } from "react-hook-form";
import { FullFormView } from "./FullFormView";
import type { FormProps, FormValues } from "./types";

/** Single-page form shell for login and other non-stepped forms. */
export const FullForm = ({
  config,
  registry,
  onSubmit,
  submitLabel,
  submittingLabel,
  isSubmitting,
  defaultValues,
}: FormProps) => {
  const form = useForm<FormValues>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues,
    resolver: config.resolver,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data, { reset: () => form.reset() });
  });

  return (
    <FullFormView
      config={config}
      registry={registry}
      form={form as UseFormReturn<FormValues>}
      onSubmit={handleSubmit}
      submitLabel={submitLabel}
      submittingLabel={submittingLabel}
      isSubmitting={isSubmitting}
    />
  );
};
