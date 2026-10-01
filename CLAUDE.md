# react-app

## Stack
React + TypeScript, webpack (Module Federation **remote**) — exposes the
`reactApp` widgets consumed by `frontend-shell`. Not run standalone in
production; `pnpm dev` here is for isolated component development only.

## Run / test
- `pnpm install` then `pnpm dev` (webpack-dev-server, standalone preview).
- `pnpm test` — Vitest + @testing-library/react.
- `pnpm lint` — ESLint, zero warnings allowed.
- `pnpm typecheck` — `tsc --noEmit`.
- `pnpm build` — production bundle exposed to `frontend-shell` via MF.

## Structure
- `src/` — currently minimal; widgets exposed via Module Federation live
  here, `src/test/` holds test setup/utilities.
- No local `api/`/`store/` layers yet — this remote is UI-only so far;
  server/client state belongs in the consuming host (`frontend-shell`)
  unless a widget genuinely needs its own local state.

## Conventions
- UI Library: Tailwind CSS + Radix UI primitives (shadcn/ui pattern) —
  components are copied in as owned source from `@szczypkaweb/shared-ui`,
  not reinvented here.
- Simple text inputs (TextField, PasswordField) are native `<input>`
  elements styled with Tailwind, wired via plain react-hook-form
  `register()` — `Controller` only for complex Radix components
  (Select/Dropdown).
- Validation is always done via Zod, regardless of the underlying component.
- Make sure `tailwind.config.js`'s `content` includes the compiled
  `@szczypkaweb/shared-ui` output, or classes used inside shared-ui won't be
  generated in this app's CSS.
- Conventional commits, everything in English.

## Never do
- Never duplicate a component that already exists in `@szczypkaweb/shared-ui`.
- Never assume this remote runs standalone in production — anything that
  depends on host-provided context (auth, routing) needs a fallback for
  isolated `pnpm dev` use.
- Never merge with a red `pnpm lint`/`pnpm typecheck`/`pnpm test`.
