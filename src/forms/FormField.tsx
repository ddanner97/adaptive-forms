"use client";

import { useFormState } from "react-hook-form";
import { getVisibleFieldError } from "./errorVisibility";
import type { AnyFieldConfig, FieldRegistry, FormValues } from "./types";
import type { UseFormReturn } from "react-hook-form";

interface FormFieldProps {
  config: AnyFieldConfig;
  form: UseFormReturn<FormValues>;
  registry: FieldRegistry;
}

/**
 * Resolves a field config to its registered renderer and computes which error,
 * if any, that renderer is allowed to show. Core never knows what kinds exist —
 * that is entirely the registry's business.
 */
export const FormField = ({ config, form, registry }: FormFieldProps) => {
  const { control, watch } = form;
  const { errors, touchedFields, dirtyFields, isSubmitted } = useFormState({
    control,
    name: config.name,
  });

  const definition = registry[config.kind];

  const fieldValue = watch(config.name);
  const fieldError = errors[config.name]?.message as string | undefined;

  const error = getVisibleFieldError({
    fieldError,
    fieldValue,
    isTouched: !!touchedFields[config.name],
    isDirty: !!dirtyFields[config.name],
    isSubmitted,
    hideErrorWhenEmpty:
      config.hideErrorWhenEmpty ?? definition?.hideErrorWhenEmpty ?? false,
  });

  if (!definition) {
    // Loud rather than silent: an unregistered kind renders nothing at all,
    // which looks like a layout bug rather than a configuration mistake.
    throw new Error(
      `No field renderer registered for kind "${config.kind}" (field "${config.name}"). ` +
        `Registered kinds: ${Object.keys(registry).join(", ") || "none"}.`,
    );
  }

  return definition.render({ config, form, error });
};
