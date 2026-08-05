## UI Library
- Tailwind CSS + Radix UI primitives (shadcn/ui pattern) - components are copied in as owned source code, not installed as a dependency.
- Simple text inputs (TextField, PasswordField) are native <input> elements styled with Tailwind, wired via plain react-hook-form register() (Controller is only needed for complex Radix components like Select/Dropdown).
- Validation is always done via Zod, regardless of the underlying component.
- In consumer apps (frontend-shell, react-app), make sure tailwind.config.js `content` includes the compiled @projekt/shared-ui output - otherwise classes used inside shared-ui won't be generated in the consumer's CSS.