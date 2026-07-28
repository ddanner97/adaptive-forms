# @ddanner97/ui

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
- **`isSubmitted` never resets.** Once a user attempts submit, a stale
  "Password is required" stays pinned to the password field forever — including
  right after they deliberately clear it to retype. `hideErrorWhenEmpty` fixes
  that class of field.
- **Errors on untouched fields.** A user still typing into field one shouldn't
  see "required" screaming from field four. Errors surface on touch, dirty, or
  submit — see `errorVisibility.ts`, which is pure and unit-tested against the
  original implementation as an oracle.
- **Nested dialogs fight over body scroll.** `useNativeDialogSync` ref-counts
  the lock and restores scroll position.

## Install

```bash
npm install @ddanner97/ui
```

Peer dependencies: `react` 19, `react-dom` 19, `react-hook-form` 7.

This package ships **raw TypeScript source**, so `"use client"` directives
survive intact rather than being stripped or misplaced by a bundler. Add it to
`transpilePackages`:

```ts
// next.config.ts
const nextConfig: NextConfig = {
  transpilePackages: ["@ddanner97/ui"],
};
```

## Theming

Components read only prefixed `--af-*` CSS variables. Map your palette onto them
once, in your global stylesheet:

```css
@import "tailwindcss";
@import "@ddanner97/ui/tokens.css";

/* Let Tailwind scan the package's class names. */
@source "../node_modules/@ddanner97/ui/src";

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
}
```

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

import { AdaptiveForm } from "@ddanner97/ui/forms";
import { tailwindFieldRegistry } from "@ddanner97/ui/fields";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });

const config = {
  resolver: zodResolver(schema),
  fields: [
    { name: "name", label: "Name", kind: "text", autoComplete: "name" },
    { name: "email", label: "Email", kind: "email", autoComplete: "email" },
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
    onSubmit={async (data) => { /* ... */ }}
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
import { tailwindFieldRegistry } from "@ddanner97/ui/fields";
import type { FieldRegistry } from "@ddanner97/ui/forms";

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
declare behavior core needs *before* rendering — currently
`hideErrorWhenEmpty`. An unregistered kind throws with the list of registered
kinds rather than silently rendering nothing.

This seam is also how a non-Tailwind design system plugs in: register MUI (or
anything else) renderers and the core is untouched.

## Going fully headless

`useSteppedForm` is the state machine on its own — step index, validation
gating, submit routing, no markup. `SteppedFormView` is just one consumer of it.

## Subpath exports

| Import | Contains |
| --- | --- |
| `@ddanner97/ui/forms` | `AdaptiveForm`, `FullForm`, `useSteppedForm`, `getVisibleFieldError`, types |
| `@ddanner97/ui/fields` | Tailwind field components, `tailwindFieldRegistry`, shared class strings |
| `@ddanner97/ui/dialogs` | `ModalDialog`, `BottomSheetDialog`, `useNativeDialogSync` |
| `@ddanner97/ui/hooks` | `useBreakpoint` |
| `@ddanner97/ui/tokens.css` | Token defaults |

## License

MIT
