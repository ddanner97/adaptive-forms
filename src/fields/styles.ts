/**
 * Shared class strings for the Tailwind preset.
 *
 * These use arbitrary-value syntax (`bg-[var(--af-primary)]`) rather than named
 * utilities (`bg-af-primary`) on purpose. A named utility would require every
 * consuming app to register the token in its own `@theme` block before anything
 * renders correctly. Arbitrary values resolve straight to the CSS variable, so
 * an app only needs to point `@source` at this package and map the tokens —
 * no Tailwind theme configuration at all.
 */

const BASE_INPUT =
  "w-full rounded-[var(--af-radius)] border bg-[var(--af-input-bg)] px-3 py-2.5 " +
  "text-base text-[var(--af-foreground)] outline-none transition-colors " +
  "placeholder:text-[var(--af-placeholder)] focus:ring-2 focus:ring-offset-1";

/** Border/focus classes shared by every input so fields stay visually consistent. */
export function getInputClassName(hasError: boolean): string {
  return `${BASE_INPUT} ${
    hasError
      ? "border-[var(--af-error)] focus:ring-[var(--af-error-ring)]"
      : "border-[var(--af-border)] focus:ring-[var(--af-ring)]"
  }`;
}

export const labelClassName =
  "block space-y-1 text-sm";

export const labelTextClassName =
  "font-medium text-[var(--af-foreground)]";

export const errorTextClassName =
  "block text-xs text-[var(--af-error)]";

export const hintTextClassName =
  "block text-xs text-[var(--af-muted)]";

export const primaryButtonClassName =
  "inline-flex w-full items-center justify-center gap-2 rounded-[var(--af-radius)] " +
  "bg-[var(--af-primary)] px-4 py-2.5 text-sm font-medium " +
  "text-[var(--af-primary-foreground)] disabled:opacity-60";

export const secondaryButtonClassName =
  "inline-flex w-full items-center justify-center gap-2 rounded-[var(--af-radius)] " +
  "border border-[var(--af-border)] bg-[var(--af-surface)] px-4 py-2.5 text-sm " +
  "font-medium text-[var(--af-foreground)] disabled:opacity-60";
