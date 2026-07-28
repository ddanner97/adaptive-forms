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
    // Suppress "required" on an empty password even after a submit attempt —
    // see errorVisibility.ts for why isSubmitted alone produces bad UX here.
    hideErrorWhenEmpty: true,
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
