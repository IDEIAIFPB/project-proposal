# Harpia Chat Backend

API desenvolvida com **NestJS** para integração com o WhatsApp via Meta API. Este backend é responsável por receber mensagens do frontend e interagir com o WhatsApp Business Cloud API.

## 🛠️ Tecnologias Utilizadas

- [NestJS](https://docs.nestjs.com/)
- TypeScript
- pnpm
- ESLint + Prettier
- HTTP Client (Axios Nest)

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` com base no exemplo abaixo:

```env
WHATSAPP_TOKEN=token_da_meta
WHATSAPP_PHONE_ID=numero_de_telefone_cadastrado_na_meta
WHATSAPP_API_URL=https://graph.facebook.com/v22.0
```

Essas variáveis são usadas para autenticar e enviar mensagens via API oficial do WhatsApp.

## ✨ Como Rodar

### Instalação

```bash
pnpm install
```

### Ambiente de Desenvolvimento

```bash
pnpm start:dev
```

### Build de Produção

```bash
pnpm build
pnpm start
```

A API estará disponível em: [http://localhost:3001](http://localhost:3001)

---

**MIT License**

Desenvolvido por [Jéfter](https://github.com/jefter-dev)
