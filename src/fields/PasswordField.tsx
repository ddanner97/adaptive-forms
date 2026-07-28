"use client";

import { forwardRef, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import {
  errorTextClassName,
  getInputClassName,
  labelClassName,
  labelTextClassName,
} from "./styles";

export interface PasswordFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  leadingIcon?: ReactNode;
  inputClassName?: string;
  /** Overridable for localization. */
  showLabel?: string;
  hideLabel?: string;
}

/** Password input with a show/hide toggle, sharing TextField's visual styling. */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      label,
      error,
      leadingIcon,
      inputClassName,
      id,
      name,
      className,
      showLabel = "Show",
      hideLabel = "Hide",
      ...props
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const fieldId = id ?? name;

    return (
      <label htmlFor={fieldId} className={labelClassName}>
        <span className={labelTextClassName}>{label}</span>
        <div className="relative">
          {leadingIcon ? (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--af-muted)]">
              {leadingIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={fieldId}
            name={name}
            type={isVisible ? "text" : "password"}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : undefined}
            className={cn(
              className ?? cn(getInputClassName(!!error), inputClassName),
              "pr-16",
              leadingIcon ? "pl-10" : undefined,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setIsVisible((visible) => !visible)}
            className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-[var(--af-muted)] hover:text-[var(--af-foreground)]"
            aria-label={isVisible ? hideLabel : showLabel}
          >
            {isVisible ? hideLabel : showLabel}
          </button>
        </div>
        {error ? (
          <span id={`${fieldId}-error`} className={errorTextClassName}>
            {error}
          </span>
        ) : null}
      </label>
    );
  },
);

PasswordField.displayName = "PasswordField";
