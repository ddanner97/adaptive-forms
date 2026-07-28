/**
 * Rules for when a validation error is allowed to be visible.
 *
 * These exist because react-hook-form's raw error state produces bad UX in two
 * specific situations, both discovered the hard way:
 *
 * 1. Showing errors on untouched fields the moment any sibling fails. A user
 *    who submits an empty form should see errors; a user still typing into
 *    field one should not see "required" screaming from field four.
 *
 * 2. `isSubmitted` latches. It never resets except via `form.reset()`, so once
 *    a user has attempted submit, a stale "Password is required" stays pinned
 *    to an empty password field forever — including right after they clear it
 *    on purpose to retype. `hideErrorWhenEmpty` suppresses that case.
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
