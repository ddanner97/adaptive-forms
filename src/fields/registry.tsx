import type { FieldRegistry, FieldRendererProps } from "../forms/types";
import { PasswordField } from "./PasswordField";
import { SelectField, type SelectOption } from "./SelectField";
import { TextField } from "./TextField";
import { TextareaField } from "./TextareaField";

/** Props every registered input shares, pulled off the config. */
function commonProps({ config, form, error }: FieldRendererProps) {
  return {
    label: config.label,
    placeholder: config.placeholder,
    autoComplete: config.autoComplete,
    leadingIcon: config.leadingIcon,
    error,
    ...form.register(config.name),
  };
}

/**
 * Default field renderers for the Tailwind preset.
 *
 * Spread this into your own registry to add app-specific kinds — anything that
 * needs to call your API (username availability, geocoded location) belongs in
 * your app, not here, which is exactly what the registry seam is for:
 *
 *   const registry = { ...tailwindFieldRegistry, username: myUsernameField };
 */
export const tailwindFieldRegistry: FieldRegistry = {
  text: {
    render: (props) => <TextField {...commonProps(props)} type="text" />,
  },
  email: {
    render: (props) => <TextField {...commonProps(props)} type="email" />,
  },
  password: {
    // Deliberately does NOT set hideErrorWhenEmpty. It was on by default here
    // and made a required password look broken: the form refused to advance
    // with nothing shown, and the input reported aria-invalid="false" while
    // invalid. The ordinary touched/dirty rules already keep errors off an
    // untouched field, so the flag bought nothing and cost correctness.
    // It remains available per-field for genuinely optional secrets.
    render: (props) => <PasswordField {...commonProps(props)} />,
  },
  textarea: {
    render: (props) => <TextareaField {...commonProps(props)} />,
  },
  select: {
    render: (props) => (
      <SelectField
        {...commonProps(props)}
        options={(props.config.options as SelectOption[]) ?? []}
      />
    ),
  },
};
