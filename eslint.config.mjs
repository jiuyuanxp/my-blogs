import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

const adminFiles = ['apps/admin/**/*.{ts,tsx}'];
const webFiles = ['apps/web/**/*.{ts,tsx}'];

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  { files: adminFiles, ...js.configs.recommended },
  ...tseslint.configs.recommended.map((c) => ({ ...c, files: adminFiles })),
  {
    files: adminFiles,
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: path.join(rootDir, 'apps/admin'),
      },
    },
  },
  ...nextVitals.map((c) => ({ ...c, files: webFiles })),
  ...nextTs.map((c) => ({ ...c, files: webFiles })),
  {
    files: webFiles,
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: path.join(rootDir, 'apps/web'),
      },
    },
  },
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
