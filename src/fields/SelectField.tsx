import { forwardRef } from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";
import {
  errorTextClassName,
  getInputClassName,
  labelClassName,
  labelTextClassName,
} from "./styles";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectFieldProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: SelectOption[];
  /** Accepted for prop parity with the other fields; selects don't render it. */
  leadingIcon?: ReactNode;
}

/** Native select with the same label/error wrapper as the other field components. */
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    { label, error, id, name, options, className, leadingIcon: _leadingIcon, ...props },
    ref,
  ) => {
    const fieldId = id ?? name;

    return (
      <label htmlFor={fieldId} className={labelClassName}>
        <span className={labelTextClassName}>{label}</span>
        <select
          ref={ref}
          id={fieldId}
          name={name}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={className ?? getInputClassName(!!error)}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error ? (
          <span id={`${fieldId}-error`} className={errorTextClassName}>
            {error}
          </span>
        ) : null}
      </label>
    );
  },
);

SelectField.displayName = "SelectField";
