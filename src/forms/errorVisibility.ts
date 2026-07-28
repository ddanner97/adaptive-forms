/**
 * Rules for when a validation error is allowed to be visible.
 *
 * The core rule exists because react-hook-form's raw error state shows errors
 * on untouched fields the moment any sibling fails. A user who submits an empty
 * form should see errors; a user still typing into field one should not see
 * "required" screaming from field four. Touched/dirty/submitted covers that.
 *
 * `hideErrorWhenEmpty` is an opt-in escape hatch for genuinely optional secrets
 * — a field that should stay quiet while blank. It is NOT set on the built-in
 * `password` kind, and should not be applied to a required field: it suppresses
 * unconditionally, including on a failed submit, which makes a form refuse to
 * advance with nothing shown and leaves the input reporting
 * `aria-invalid="false"` while invalid.
 *
 * Note it cannot be rescued by keying on `isSubmitted`: intermediate wizard
 * steps validate through `trigger()`, which never sets `isSubmitted` at all.
 */

function fieldHasInput(value: unknown): boolean {
  return typeof value === "string" && value.length > 0;
}

export interface ErrorVisibilityInput {
  fieldError: string | undefined;
  fieldValue: unknown;
  isTouched: boolean;
  isDirty: boolean;
  isSubmitted: boolean;
  hideErrorWhenEmpty: boolean;
}

/** Returns the error to display, or undefined to stay silent for now. */
export function getVisibleFieldError({
  fieldError,
  fieldValue,
  isTouched,
  isDirty,
  isSubmitted,
  hideErrorWhenEmpty,
}: ErrorVisibilityInput): string | undefined {
  if (!fieldError) {
    return undefined;
  }

  if (hideErrorWhenEmpty && !fieldHasInput(fieldValue)) {
    return undefined;
  }

  if (isSubmitted) {
    return fieldError;
  }

  return isTouched || isDirty ? fieldError : undefined;
}
