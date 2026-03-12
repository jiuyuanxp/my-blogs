import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

const adminFiles = ['apps/admin/**/*.{ts,tsx}'];
const webFiles = ['apps/web/**/*.{ts,tsx}'];

export default defineConfig([
  { files: adminFiles, ...js.configs.recommended },
  ...tseslint.configs.recommended.map((c) => ({ ...c, files: adminFiles })),
  ...nextVitals.map((c) => ({ ...c, files: webFiles })),
  ...nextTs.map((c) => ({ ...c, files: webFiles })),
  globalIgnores([
    '.next/**',
    'out/**',
    'node_modules/**',
    '**/eslint.config.mjs',
    'dist/**',
    'build/**',
  ]),
  eslintConfigPrettier,
]);
