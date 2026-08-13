import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';

// Mirrors frontend-shell/eslint.config.mjs - same stack (React + TS +
// webpack), kept identical on purpose so both apps lint under the same
// rules. react-app previously had a `lint` script with no eslint installed
// and no config file at all - this is the first time it's actually
// runnable, found while wiring `pnpm lint` into CI for the first time.
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  prettierConfig,
  { ignores: ['dist', 'node_modules'] },
);
