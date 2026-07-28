# @ddanner97/adaptive-forms

Config-driven multi-step form engine and UI primitives for React 19 + Next.js.

The headline feature is **AdaptiveForm**: describe a form once as config, get a
stepped wizard on mobile and a single-page form on desktop. The engine core is
headless — it owns step state, per-step validation gating, and error visibility,
and renders nothing. A Tailwind preset ships as the default look.

## Why this exists

Most form libraries handle validation. The fiddly parts that actually cost days
are elsewhere, and they're baked in here:

- **Mobile keyboards submit your form early.** If a wizard step has no
  `type="submit"` button in the DOM, some mobile keyboards' "Go" action submits
  natively — running full-schema validation against still-unmounted later-step
  fields, failing, and permanently latching react-hook-form's `isSubmitted`.
  Every step renders a real submit button and routes through one handler.
- **Errors on untouched fields.** A user still typing into field one shouldn't
  see "required" screaming from field four. Errors surface on touch, dirty, or
  submit — see `errorVisibility.ts`, which is pure and unit-tested against the
  original implementation as an oracle.
- **Silent dead buttons.** A validation rule that hides an error on an empty
  field makes a required step refuse to advance with nothing shown, and reports
  `aria-invalid="false"` on an invalid input. `hideErrorWhenEmpty` exists for
  genuinely optional secrets and is deliberately off for the built-in
  `password` kind; there are integration tests pinning both the intermediate
  step and final submit paths.
- **Double submits.** Both views disable the submit control on react-hook-form's
  own `formState.isSubmitting` as well as the `isSubmitting` prop, so an async
  handler is locked even if the consumer never threads the prop back in.
- **Nested dialogs fight over body scroll.** `useNativeDialogSync` ref-counts
  the lock and restores scroll position.

## Install

Not on npm yet — install straight from GitHub, pinned to a tag:

```bash
npm install github:ddanner97/adaptive-forms#v0.1.1
```

The package name stays `@ddanner97/adaptive-forms`, so imports are unaffected by where it
came from. Pin to a tag rather than tracking the default branch: without a tag,
`npm install` resolves to whatever `main` points at, and a fresh lockfile can
pick up unreleased changes.

Peer dependencies: `react` 19, `react-dom` 19, `react-hook-form` 7.

This package ships **raw TypeScript source**, so `"use client"` directives
survive intact rather than being stripped or misplaced by a bundler. Add it to
`transpilePackages`:

```ts
// next.config.ts
const nextConfig: NextConfig = {
  transpilePackages: ["@ddanner97/adaptive-forms"],
};
```

## Theming

Components read only prefixed `--af-*` CSS variables. Map your palette onto them
once, in your global stylesheet:

```css
@import "tailwindcss";
@import "@ddanner97/adaptive-forms/tokens.css";

/* Let Tailwind scan the package's class names. */
@source "../node_modules/@ddanner97/adaptive-forms/src";

:root {
  --af-surface: var(--color-surface);
  --af-input-bg: var(--color-input-bg);
  --af-foreground: var(--color-body);
  --af-muted: var(--color-muted);
  --af-placeholder: var(--color-placeholder);
  --af-primary: var(--color-accent);
  --af-primary-foreground: #ffffff;
  --af-border: var(--color-border);
  --af-ring: var(--color-accent);
  /* Optional: point at your heading face so stepped titles match your other
     headings. Defaults to `inherit` (your body font) if you skip it. */
  --af-font-display: var(--font-fraunces);
}
```

Map these in **every scope that re-pins the tokens they reference**, not just
`:root`. Custom properties inherit as _computed_ values, so `--af-foreground:
var(--foreground)` resolved at `:root` freezes there — if a descendant class
re-pins `--foreground` (e.g. a `.force-light` wrapper that keeps auth screens
light in OS dark mode), the alias will not follow it and the library will render
the wrong colour. Use a selector list: `:root, .force-light { … }`.

Two deliberate choices here. The prefix exists because token names collide in
practice — `--color-accent` is a decorative tint in one real consuming app and
the primary action color in another, so reading unprefixed names would render
plausible-looking wrong colors instead of failing loudly. And because the
classes resolve to `bg-[var(--af-primary)]` rather than a named `bg-af-primary`
utility, you need **no Tailwind `@theme` configuration at all**.

Because these are plain CSS variables, runtime theme switching (writing vars
onto `document.documentElement`) works without the library knowing about it.

## Usage

A config plus a registry is all a form needs.

```tsx
"use client";

import { AdaptiveForm } from "@ddanner97/adaptive-forms/forms";
import { tailwindFieldRegistry } from "@ddanner97/adaptive-forms/fields";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const config = {
  resolver: zodResolver(schema),
  fields: [
    { name: "name", label: "Name", kind: "text", autoComplete: "name" },
    {
      name: "email",
      label: "Email",
      kind: "email",
      autoComplete: "email",
    },
    { name: "password", label: "Password", kind: "password" },
  ],
  steps: [
    { title: "Your profile", fieldNames: ["name"] },
    { title: "Contact", fieldNames: ["email"] },
    { title: "Security", fieldNames: ["password"] },
  ],
};

export const SignUpForm = () => (
  <AdaptiveForm
    config={config}
    registry={tailwindFieldRegistry}
    onSubmit={async (data) => {
      /* ... */
    }}
    submitLabel="Create account"
  />
);
```

The engine takes a **react-hook-form resolver**, not a schema, so it carries no
validation dependency and works with zod, valibot, or yup interchangeably.

Use `FullForm` instead of `AdaptiveForm` for single-page forms (login, etc.).

## Custom fields

The registry is the extension seam. Anything that talks to your API — username
availability, geocoded location, an upload widget — lives in your app:

```tsx
import { tailwindFieldRegistry } from "@ddanner97/adaptive-forms/fields";
import type { FieldRegistry } from "@ddanner97/adaptive-forms/forms";

const registry: FieldRegistry = {
  ...tailwindFieldRegistry,
  username: {
    render: ({ config, form, error }) => (
      <UsernameField config={config} form={form} error={error} />
    ),
  },
};
```

A `FieldDefinition` is an object rather than a bare function so a kind can
declare behavior core needs _before_ rendering — currently
`hideErrorWhenEmpty`. An unregistered kind throws with the list of registered
kinds rather than silently rendering nothing.

This seam is also how a non-Tailwind design system plugs in: register MUI (or
anything else) renderers and the core is untouched.

## Going fully headless

`useSteppedForm` is the state machine on its own — step index, validation
gating, submit routing, no markup. `SteppedFormView` is just one consumer of it.

## Subpath exports

| Import                                 | Contains                                                                    |
| -------------------------------------- | --------------------------------------------------------------------------- |
| `@ddanner97/adaptive-forms/forms`      | `AdaptiveForm`, `FullForm`, `useSteppedForm`, `getVisibleFieldError`, types |
| `@ddanner97/adaptive-forms/fields`     | Tailwind field components, `tailwindFieldRegistry`, shared class strings    |
| `@ddanner97/adaptive-forms/dialogs`    | `ModalDialog`, `BottomSheetDialog`, `useNativeDialogSync`                   |
| `@ddanner97/adaptive-forms/hooks`      | `useBreakpoint`                                                             |
| `@ddanner97/adaptive-forms/tokens.css` | Token defaults                                                              |

## License

MIT
