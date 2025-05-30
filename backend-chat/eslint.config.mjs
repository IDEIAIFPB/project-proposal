// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    // Configuração específica do Prettier para resolver o erro "Delete ␍"
    files: ['**/*.{js,ts}'],
    rules: {
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto', // Permite que o Prettier detecte automaticamente (CRLF ou LF)
          singleQuote: true,  // Exemplo: opcional, mas comum em projetos TypeScript
          trailingComma: 'es5', // Opcional
        },
      ],
    },
  },
  eslintPluginPrettierRecommended, // Mantém as recomendações padrão do Prettier
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
);