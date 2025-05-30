import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc'; // Importe o plugin SWC

export default defineConfig({
  // Adicione a seção de plugins do Vite aqui
  plugins: [
    swc.vite({// Ou apenas swc() dependendo de como unplugin-swc exporta
      // Configurações explícitas para o SWC garantir compatibilidade com NestJS
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: false, // Defina como true se você usar TSX
          decorators: true, // Habilitar parsing de decoradores
        },
        transform: {
          legacyDecorator: true, // NestJS usa decoradores "legacy"
          decoratorMetadata: true, // ESSENCIAL para emitir metadados para DI
        },
        keepClassNames: true, // Pode ajudar com DI e nomes de classes
        // target: 'es2021', // Opcional: pode definir um target se necessário, mas o do tsconfig deve ser pego
      },
      // É importante que o SWC use as configurações do seu tsconfig.json também.
      // O unplugin-swc geralmente tenta fazer isso, mas ser explícito aqui pode ajudar.
      // Verifique a documentação do unplugin-swc para a melhor forma de garantir
      // que ele leia o tsconfig.json para outras opções como 'target', 'module', etc.,
      // ou se você precisa especificá-las aqui.
      // Muitas vezes, apenas as opções 'jsc' acima são suficientes para corrigir problemas de metadados.
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/main.ts',
        'src/app.module.ts',
        '**/*.config.?(c|m)[jt]s',
        '**/*.filter.?(c|m)[jt]s',
        '**/node_modules/**',
        'test/**',
        'src/**/*.module.ts',
        'src/**/*.interface.ts',
        'src/app.controller.ts',
        'src/app.service.ts',
      ],
    },
  },
});
