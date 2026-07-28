import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import {
  errorTextClassName,
  getInputClassName,
  hintTextClassName,
  labelClassName,
  labelTextClassName,
} from "./styles";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Secondary message shown under the field when there is no error. */
  hint?: string;
  hintClassName?: string;
  /** Icon rendered inside the input, left-aligned. */
  leadingIcon?: ReactNode;
  /** Extra classes merged onto the input's defaults (theming hook). */
  inputClassName?: string;
}

/** Forward-ref text input with shared label, error, and focus styling for react-hook-form. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      error,
      hint,
      hintClassName,
      leadingIcon,
      inputClassName,
      id,
      name,
      className,
      ...props
    },
    ref,
  ) => {
    const fieldId = id ?? name;
    const describedBy = error
      ? `${fieldId}-error`
      : hint
        ? `${fieldId}-hint`
        : undefined;

    const input = (
      <input
        ref={ref}
        id={fieldId}
        name={name}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={
          className ??
          cn(
            getInputClassName(!!error),
            leadingIcon ? "pl-10" : undefined,
            inputClassName,
          )
        }
        {...props}
      />
    );

    return (
      <label htmlFor={fieldId} className={labelClassName}>
        <span className={labelTextClassName}>{label}</span>
        {leadingIcon ? (
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--af-muted)]">
              {leadingIcon}
            </span>
            {input}
          </div>
        ) : (
          input
        )}
        {error ? (
          <span id={`${fieldId}-error`} className={errorTextClassName}>
            {error}
          </span>
        ) : hint ? (
          <span
            id={`${fieldId}-hint`}
            className={hintClassName ?? hintTextClassName}
          >
            {hint}
          </span>
        ) : null}
      </label>
    );
  },
);

TextField.displayName = "TextField";
