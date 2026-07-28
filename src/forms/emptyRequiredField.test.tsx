import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Resolver } from "react-hook-form";
import { AdaptiveForm } from "./AdaptiveForm";
import { FullForm } from "./FullForm";
import { tailwindFieldRegistry } from "../fields/registry";
import type { FormValues } from "./types";
import { setViewport } from "../test/setup";

/**
 * Regression tests for the empty-required-password bug: the password renderer
 * suppressed its error even on a failed submit, so the form refused to advance
 * with no visible reason and reported aria-invalid="false" on an invalid field.
 *
 * Deliberately hand-rolled instead of using zod — the engine takes a
 * react-hook-form resolver, so the tests carry no validation dependency either.
 */
const LABELS: Record<string, string> = { password: "Password", name: "Name" };

/** Marks exactly the named fields required, so each test declares its own shape. */
function requiredResolver(...required: string[]): Resolver<FormValues> {
  return async (values) => {
    const errors: Record<string, { type: string; message: string }> = {};

    for (const key of required) {
      const value = values?.[key];
      if (typeof value !== "string" || value.length === 0) {
        errors[key] = {
          type: "required",
          message: `${LABELS[key]} is required`,
        };
      }
    }

    return Object.keys(errors).length > 0
      ? { values: {}, errors }
      : { values, errors: {} };
  };
}

const passwordField = {
  name: "password",
  label: "Password",
  kind: "password",
  placeholder: "Create a password",
};

const nameField = { name: "name", label: "Name", kind: "text" };

describe("empty required password", () => {
  it("shows the error and blocks advancing on an INTERMEDIATE step", async () => {
    // Intermediate steps validate via trigger(), which never sets RHF's
    // isSubmitted — so any rule keyed on isSubmitted cannot rescue this case.
    setViewport("mobile");
    const user = userEvent.setup();

    render(
      <AdaptiveForm
        config={{
          resolver: requiredResolver("password", "name"),
          fields: [passwordField, nameField],
          steps: [
            { title: "Security", fieldNames: ["password"] },
            { title: "Profile", fieldNames: ["name"] },
          ],
        }}
        registry={tailwindFieldRegistry}
        onSubmit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(await screen.findByText("Password is required")).toBeTruthy();
    // Still on step 1: the second step's field must not have mounted.
    expect(document.querySelector('input[name="name"]')).toBeNull();
    expect(
      document.querySelector('input[name="password"]')?.getAttribute("aria-invalid"),
    ).toBe("true");
  });

  it("shows the error, sets aria-invalid, and does not submit on the FINAL form", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <FullForm
        config={{ resolver: requiredResolver("password"), fields: [passwordField] }}
        registry={tailwindFieldRegistry}
        onSubmit={onSubmit}
        submitLabel="Create account"
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /create account/i }),
    );

    expect(await screen.findByText("Password is required")).toBeTruthy();
    expect(
      document.querySelector('input[name="password"]')?.getAttribute("aria-invalid"),
    ).toBe("true");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("still submits once the password is filled in", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <FullForm
        config={{ resolver: requiredResolver("password"), fields: [passwordField] }}
        registry={tailwindFieldRegistry}
        onSubmit={onSubmit}
        submitLabel="Create account"
      />,
    );

    await user.type(
      screen.getByPlaceholderText("Create a password"),
      "correct horse battery",
    );
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });
});
