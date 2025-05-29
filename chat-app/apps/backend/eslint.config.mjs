import { fileURLToPath } from 'node:url';
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            '**/dist/**',
            '**/*.config.*',
            '.next',
            'node_modules'
        ],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            globals: {
                ...globals.node,
            },
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
                createDefaultProgram: true,
            },
        },
        settings: {
            'import/resolver': {
                typescript: {
                    project: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
                    alwaysTryTypes: true
                },
                node: {
                    paths: [
                        fileURLToPath(new URL('./node_modules', import.meta.url)),
                        fileURLToPath(new URL('../../../node_modules', import.meta.url))
                    ],
                    extensions: ['.js', '.ts', '.mjs', '.cjs']
                }
            }
        },
        rules: {
            '@typescript-eslint/no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_'
            }],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',
            '@typescript-eslint/no-misused-promises': 'error',
            'semi': ['error', 'always'],
            'quotes': ['error', 'double', { avoidEscape: true }],
        },
    },
);
