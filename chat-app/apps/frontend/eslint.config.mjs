import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        languageOptions: {
            globals: {
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
            '@typescript-eslint/no-unsafe-argument': 'warn',
            '@typescript-eslint/no-misused-promises': 'error',
            'semi': ['error', 'always'],
            'quotes': ['error', 'double', { avoidEscape: true }],
        },
    }
];

export default eslintConfig;
