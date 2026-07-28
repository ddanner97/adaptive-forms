import { describe, expect, it } from "vitest";
import { getVisibleFieldError } from "./errorVisibility";

const base = {
  fieldError: "Required",
  fieldValue: "",
  isTouched: false,
  isDirty: false,
  isSubmitted: false,
  hideErrorWhenEmpty: false,
};

describe("getVisibleFieldError", () => {
  it("stays silent when there is no error", () => {
    expect(
      getVisibleFieldError({ ...base, fieldError: undefined, isSubmitted: true }),
    ).toBeUndefined();
  });

  it("stays silent on an untouched, pristine field before submit", () => {
    expect(getVisibleFieldError(base)).toBeUndefined();
  });

  it("shows once the field is touched", () => {
    expect(getVisibleFieldError({ ...base, isTouched: true })).toBe("Required");
  });

  it("shows once the field is dirty", () => {
    expect(getVisibleFieldError({ ...base, isDirty: true })).toBe("Required");
  });

  it("shows on every errored field after a submit attempt", () => {
    expect(getVisibleFieldError({ ...base, isSubmitted: true })).toBe("Required");
  });

  describe("hideErrorWhenEmpty (password-like fields)", () => {
    it("stays silent on an empty field even after submit", () => {
      // The bug this exists for: isSubmitted latches and never resets, so
      // without this rule a stale "required" stays pinned to the password
      // field forever once the user has attempted submit.
      expect(
        getVisibleFieldError({
          ...base,
          hideErrorWhenEmpty: true,
          isSubmitted: true,
          fieldValue: "",
        }),
      ).toBeUndefined();
    });

    it("stays silent after the user clears the field to retype", () => {
      expect(
        getVisibleFieldError({
          ...base,
          hideErrorWhenEmpty: true,
          isSubmitted: true,
          isTouched: true,
          isDirty: true,
          fieldValue: "",
        }),
      ).toBeUndefined();
    });

    it("shows once the field has input and was touched", () => {
      expect(
        getVisibleFieldError({
          ...base,
          hideErrorWhenEmpty: true,
          isTouched: true,
          fieldValue: "abc",
          fieldError: "Password must be at least 8 characters",
        }),
      ).toBe("Password must be at least 8 characters");
    });

    it("shows on a filled field after submit", () => {
      expect(
        getVisibleFieldError({
          ...base,
          hideErrorWhenEmpty: true,
          isSubmitted: true,
          fieldValue: "abc",
        }),
      ).toBe("Required");
    });

    it("treats non-string values as empty", () => {
      expect(
        getVisibleFieldError({
          ...base,
          hideErrorWhenEmpty: true,
          isSubmitted: true,
          fieldValue: { action: "keep" },
        }),
      ).toBeUndefined();
    });
  });

  describe("matches the original concert-social implementation", () => {
    /** Verbatim port of the pre-extraction logic, kept as an oracle so the
     * simplification (collapsing the redundant password branch) is proven
     * rather than assumed. */
    function original(
      fieldError: string | undefined,
      fieldValue: unknown,
      isTouched: boolean,
      isDirty: boolean,
      isSubmitted: boolean,
      kind: string,
    ): string | undefined {
      if (!fieldError) return undefined;
      const hasInput = typeof fieldValue === "string" && fieldValue.length > 0;
      if (kind === "password" && !hasInput) return undefined;
      if (isSubmitted) return fieldError;
      if (kind === "password") {
        return hasInput && (isTouched || isDirty) ? fieldError : undefined;
      }
      return isTouched || isDirty ? fieldError : undefined;
    }

    it("agrees across the full input space", () => {
      const errors = [undefined, "Required"];
      const values: unknown[] = ["", "abc", undefined, 42];
      const bools = [false, true];
      const kinds = ["password", "text"];

      for (const fieldError of errors) {
        for (const fieldValue of values) {
          for (const isTouched of bools) {
            for (const isDirty of bools) {
              for (const isSubmitted of bools) {
                for (const kind of kinds) {
                  const expected = original(
                    fieldError,
                    fieldValue,
                    isTouched,
                    isDirty,
                    isSubmitted,
                    kind,
                  );
                  const actual = getVisibleFieldError({
                    fieldError,
                    fieldValue,
                    isTouched,
                    isDirty,
                    isSubmitted,
                    hideErrorWhenEmpty: kind === "password",
                  });

                  expect(actual, JSON.stringify({ fieldError, fieldValue, isTouched, isDirty, isSubmitted, kind })).toBe(expected);
                }
              }
            }
          }
        }
      }
    });
  });
});
