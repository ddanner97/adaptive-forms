import type { ReactNode } from "react";
import type { FieldValues, Resolver, UseFormReturn } from "react-hook-form";

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

/**
 * What a view needs to render: fields and step grouping, no validation.
 *
 * Kept separate from FormConfig because `Resolver<T>` is contravariant in T, so
 * a `FormConfig<RegisterData>` is not assignable to `FormConfig<FieldValues>`.
 * Views never touch the resolver, so taking the layout alone sidesteps the
 * variance problem entirely instead of pushing casts onto consumers.
 */
export interface FormLayout {
  fields: AnyFieldConfig[];
  steps?: FormStep[];
}

export interface FormConfig<TValues extends FieldValues = FieldValues>
  extends FormLayout {
  /**
   * A react-hook-form resolver. The library takes a resolver rather than a
   * schema so it stays neutral across zod/valibot/yup and carries no validation
   * dependency of its own. For zod: `resolver: zodResolver(mySchema)`.
   */
  resolver: Resolver<TValues>;
}

export interface FormSubmitHelpers {
  reset: () => void;
}

export interface FormProps<TValues extends FieldValues = FieldValues> {
  config: FormConfig<TValues>;
  registry: FieldRegistry;
  /** `data` is typed by the resolver, so `FormConfig<RegisterData>` yields a
   * typed submit handler with no cast at the call site. */
  onSubmit: (data: TValues, helpers: FormSubmitHelpers) => void | Promise<void>;
  submitLabel?: string;
  submittingLabel?: string;
  isSubmitting?: boolean;
  defaultValues?: FormValues;
  /** Fires when the stepped view changes step; never fires from the full
   * (desktop) view, which has no steps. */
  onStepChange?: (current: number, total: number) => void;
}
