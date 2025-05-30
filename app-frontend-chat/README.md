# Aplicação de Chat Frontend em Tempo Real

Este projeto é o frontend para uma aplicação de chat em tempo real construída com Next.js, React, TypeScript e Socket.IO. Ele permite que os usuários participem de conversas, visualizem o histórico de mensagens e vejam o status da conexão em tempo real com o servidor de chat.

## Funcionalidades

* **Mensagens em Tempo Real:** Envie e receba mensagens instantaneamente via WebSockets.
* **Gerenciamento de Conversas:**
    * Visualize uma lista de conversas ativas.
    * Selecione uma conversa para visualizar suas mensagens.
    * Exibe o número de telefone do cliente na conversa.
* **Exibição de Mensagens:**
    * Mostra mensagens recebidas e enviadas.
    * Inclui timestamps para cada mensagem.
    * Rolagem automática para a mensagem mais recente.
* **Status da Conexão:** Indica se a aplicação está conectada ao servidor de chat.
* **Notificações:** Usa notificações do tipo "toast" (via `sonner`) para eventos como conexão, desconexão e erros no envio de mensagens.
* **UI Responsiva:** Construída com componentes de UI modernos.

## Tecnologias e Principais Bibliotecas

* **Framework:** Next.js (App Router)
* **Linguagem:** TypeScript
* **Biblioteca de UI:** React
* **Comunicação em Tempo Real:** Socket.IO Client
* **Componentes de UI:**
    * Componentes de UI personalizados construídos com `shadcn/ui` (usando o utilitário `cn`, primitivas Radix UI como `ScrollAreaPrimitive`, `Slot`).
    * Componentes incluem: `Card`, `Button`, `Input`, `ScrollArea`.
* **Estilização:** Tailwind CSS (implícito pelo utilitário `cn` e nomes de classes)
* **Ícones:** `lucide-react`
* **Notificações:** `sonner`
* **Utilitários:**
    * `class-variance-authority` (`cva`) para variantes de componentes.
    * `tailwind-merge` (parte do `cn` de `@/lib/utils`) para mesclar classes Tailwind.

## Destaques da Estrutura do Projeto


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
