import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "../utils/cn";
import {
  errorTextClassName,
  getInputClassName,
  labelClassName,
  labelTextClassName,
} from "./styles";

export interface TextareaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  inputClassName?: string;
}

/** Forward-ref textarea with shared label and error styling for react-hook-form. */
export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(
  (
    { label, error, inputClassName, id, name, className, rows = 4, ...props },
    ref,
  ) => {
    const fieldId = id ?? name;

    return (
      <label htmlFor={fieldId} className={labelClassName}>
        <span className={labelTextClassName}>{label}</span>
        <textarea
          ref={ref}
          id={fieldId}
          name={name}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={
            className ??
            cn(getInputClassName(!!error), "min-h-24 resize-y", inputClassName)
          }
          {...props}
        />
        {error ? (
          <span id={`${fieldId}-error`} className={errorTextClassName}>
            {error}
          </span>
        ) : null}
      </label>
    );
  },
);

TextareaField.displayName = "TextareaField";
