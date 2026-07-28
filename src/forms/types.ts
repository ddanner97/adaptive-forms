import type { ReactNode } from "react";
import type { Resolver, UseFormReturn } from "react-hook-form";

/** The form values shape the engine operates on. Field configs are dynamic, so
 * values stay an open record and renderers narrow their own field's type. */
export type FormValues = Record<string, unknown>;

/**
 * Properties every field renderer can rely on. `kind` is an open string rather
 * than a union — the registry decides which kinds exist, which is what keeps
 * app-specific fields (username availability, geocoded location) out of core.
 */
export interface BaseFieldConfig {
  name: string;
  label: string;
  kind: string;
  /** Optional grouping hint; `FormStep.fieldNames` is what actually drives steps. */
  step?: number;
  placeholder?: string;
  autoComplete?: string;
  /** Icon rendered inside the input, left-aligned. Kept as a ReactNode so the
   * library stays icon-library agnostic (lucide, MUI icons, inline SVG). */
  leadingIcon?: ReactNode;
  /**
   * Never surface a validation error while the field is empty, even after a
   * submit attempt. Set per-kind by the registry; override here per-field.
   */
  hideErrorWhenEmpty?: boolean;
}

/** A field config plus whatever extra options its renderer defines. */
export type AnyFieldConfig = BaseFieldConfig & Record<string, unknown>;

export interface FieldRendererProps {
  config: AnyFieldConfig;
  form: UseFormReturn<FormValues>;
  /** Already filtered through the visibility rules — render it as-is. */
  error?: string;
}

export type FieldRenderer = (props: FieldRendererProps) => ReactNode;

/**
 * A registered field kind. Declared as an object rather than a bare render
 * function so a kind can carry behavior flags that core needs to know about
 * *before* rendering (like error visibility).
 */
export interface FieldDefinition {
  render: FieldRenderer;
  /** Default for `BaseFieldConfig.hideErrorWhenEmpty` for this kind. */
  hideErrorWhenEmpty?: boolean;
}

export type FieldRegistry = Record<string, FieldDefinition>;

export interface FormStep {
  title?: string;
  fieldNames: string[];
}

export interface FormConfig {
  fields: AnyFieldConfig[];
  /**
   * A react-hook-form resolver. The library takes a resolver rather than a
   * schema so it stays neutral across zod/valibot/yup and carries no validation
   * dependency of its own. For zod: `resolver: zodResolver(mySchema)`.
   */
  resolver: Resolver<FormValues>;
  steps?: FormStep[];
}

export interface FormSubmitHelpers {
  reset: () => void;
}

export interface FormProps {
  config: FormConfig;
  registry: FieldRegistry;
  onSubmit: (
    data: FormValues,
    helpers: FormSubmitHelpers,
  ) => void | Promise<void>;
  submitLabel?: string;
  submittingLabel?: string;
  isSubmitting?: boolean;
  defaultValues?: FormValues;
  /** Fires when the stepped view changes step; never fires from the full
   * (desktop) view, which has no steps. */
  onStepChange?: (current: number, total: number) => void;
}
