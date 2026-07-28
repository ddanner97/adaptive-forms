"use client";

import {
  useForm,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import { FullFormView } from "./FullFormView";
import type { FormProps, FormValues } from "./types";

/** Single-page form shell for login and other non-stepped forms. */
export const FullForm = <TValues extends FieldValues = FieldValues>({
  config,
  registry,
  onSubmit,
  submitLabel,
  submittingLabel,
  isSubmitting,
  defaultValues,
}: FormProps<TValues>) => {
  const form = useForm<FormValues>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues,
    resolver: config.resolver as unknown as Resolver<FormValues>,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data as unknown as TValues, { reset: () => form.reset() });
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
