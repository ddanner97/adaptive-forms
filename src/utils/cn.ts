/** Minimal class-merging helper — filters falsy values and joins. */
export function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
