# Documentação do Backend do Chat

Este documento descreve a arquitetura e os componentes do backend do sistema de chat. O backend é construído usando NestJS e se integra com a API do WhatsApp (Meta API) para enviar e receber mensagens.

## Visão Geral da Arquitetura

O sistema é modularizado, com responsabilidades bem definidas:

* **`AppModule`**: Módulo raiz que importa e configura os demais módulos da aplicação.
* **`ConfigModule`**: Gerencia as variáveis de ambiente e configurações da aplicação.
* **`HttpModule`**: Utilizado para realizar chamadas HTTP externas, principalmente para a Meta API.
* **`MetaApiModule`**: Encapsula toda a lógica de interação com a API do WhatsApp Business (Meta API), incluindo o envio de mensagens e o processamento de webhooks.
* **`ChatModule`**: Contém a lógica de negócios do chat, gerenciamento de conversas e a comunicação em tempo real com os clientes conectados via WebSockets.
* **`EventEmitterModule`**: Utilizado para comunicação baseada em eventos entre diferentes partes da aplicação (ex: notificar o `ChatGateway` sobre novas mensagens recebidas pelo `ChatService`).
* **Filtro de Exceções Global (`AllExceptionsFilter`)**: Captura todas as exceções não tratadas na aplicação, padronizando as respostas de erro.

## Fluxo de Mensagens

### Mensagem Recebida (Ex: WhatsApp -> Backend -> Frontend)

1.  **Meta API -> `MetaApiController`**: O WhatsApp envia uma notificação de nova mensagem para o endpoint `/webhook` (POST).
2.  **`MetaApiController`**:
    * Valida a requisição.
    * Extrai as informações da mensagem (remetente, texto, tipo).
    * Emite um evento interno `whatsapp.incomingMessage` com os dados da mensagem.
3.  **`ChatService` (`@OnEvent('whatsapp.incomingMessage')`)**:
    * Ouve o evento `whatsapp.incomingMessage`.
    * Processa a mensagem:
        * Cria um objeto `ChatMessage` do tipo `incoming`.
        * Salva a mensagem no histórico de conversas (em memória).
        * Emite um evento `chat.incoming` com o `ChatMessage`.
        * Prepara e envia uma mensagem de resposta automática para o usuário via `MetaApiService`.
        * Salva a mensagem de resposta (outgoing) e emite um evento `chat.outgoing`.
4.  **`ChatGateway` (`@OnEvent('chat.incoming')` e `@OnEvent('chat.outgoing')`)**:
    * Ouve os eventos `chat.incoming` e `chat.outgoing`. 
    * Emite eventos WebSocket (`incomingMessage`, `outgoingMessage`) para todos os clientes frontend conectados, contendo o `ChatMessage`.
5.  **Frontend**: Recebe os eventos WebSocket e atualiza a interface do chat.

### Mensagem Enviada (Ex: Frontend -> Backend -> WhatsApp)

1.  **Frontend -> `ChatGateway`**: O cliente frontend envia uma mensagem WebSocket com o evento `sendMessage`, contendo `to` (destinatário) e `message` (texto).
2.  **`ChatGateway` (`@SubscribeMessage('sendMessage')`)**:
    * Recebe a mensagem do cliente. 
    * Chama `chatService.handleOutgoingMessage(data.to, data.message)`.
    * Em caso de erro no `ChatService`, emite um evento `messageSendError` de volta para o cliente.
3.  **`ChatService` (`handleOutgoingMessage`)**:
    * Envia a mensagem para o destinatário via `metaApiService.sendMessage(to, message)`.
    * Cria um objeto `ChatMessage` do tipo `outgoing`.
    * Salva a mensagem no histórico (em memória). 
    * Emite um evento `chat.outgoing` com o `ChatMessage`. 
4.  **`ChatGateway` (`@OnEvent('chat.outgoing')`)**:
    * Ouve o evento `chat.outgoing`. 
    * Emite o evento WebSocket `outgoingMessage` para todos os clientes frontend.
5.  **Frontend**: Recebe o evento `outgoingMessage` e atualiza a interface do chat (confirmando o envio).
6.  **`MetaApiService`**: Lida com o envio da mensagem para a API do WhatsApp. 

---

## Módulos Detalhados

### 1. `AppModule` (`src/app.module.ts`)

Módulo raiz da aplicação.

* **Imports**:
    * `ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.development', '.env'] })`: Configura o carregamento de variáveis de ambiente.
    * `HttpModule.register({ timeout: 5000, maxRedirects: 5 })`: Configura o módulo HTTP para requisições externas.
    * `MetaApiModule`: Módulo de integração com a Meta API.
    * `ChatModule`: Módulo de lógica do chat.
* **Controllers**: `AppController` (para rotas básicas, como health check).
* **Providers**: `AppService` (serviço básico).

---

### 2. `MetaApiModule` (`src/meta-api/`)

Responsável pela comunicação com a API do WhatsApp (Meta).

#### 2.1. `MetaApiController` (`meta-api.controller.ts`)

Controlador para lidar com as requisições de webhook da Meta API.

* **Rota Base**: `/webhook`
* **Endpoints**:
    * `GET /`: Usado para a verificação do webhook pela Meta. Recebe `hub.mode`, `hub.verify_token`, `hub.challenge` e responde com o `challenge` se a verificação for bem-sucedida.
    * `POST /`: Recebe as notificações de eventos do WhatsApp (ex: novas mensagens).
        * Processa o payload do webhook, extrai as mensagens de texto e emite o evento `whatsapp.incomingMessage` via `EventEmitter2`.
* **Dependências**: `MetaApiService`, `EventEmitter2`. 

#### 2.2. `MetaApiService` (`meta-api.service.ts`)

Serviço para interagir com a Meta API.

* **`onModuleInit()`**: Carrega as configurações da API (URL, ID do número de telefone, token de acesso, token de verificação do webhook) das variáveis de ambiente. Lança um erro se alguma configuração estiver faltando.
* **`sendMessage(to: string, message: string)`**:
    * Formata o número do destinatário (adiciona `+` e o nono dígito para números brasileiros específicos). 
    * Envia uma mensagem de texto para a API do WhatsApp usando `HttpService`. 
    * Trata erros da API, incluindo `AxiosError`, e lança `HttpException` com detalhes para serem capturados pelo `AllExceptionsFilter`.
* **`getWebhookVerifyToken()`**: Retorna o token de verificação do webhook.
* **Dependências**: `ConfigService`, `HttpService`.

#### 2.3. `MetaApiModule` (`meta-api.module.ts`)

Define o módulo.

* **Imports**: `ConfigModule`, `HttpModule`, `EventEmitterModule`.
* **Providers**: `MetaApiService`.
* **Exports**: `MetaApiService` (para ser usado por outros módulos, como `ChatModule`).
* **Controllers**: `MetaApiController`.

#### 2.4. Interfaces (`src/meta-api/` e `src/common/interfaces/`)

* **`WhatsappWebhookPayload` e relacionadas (`WhatsappWebhookEntry`, `WhatsappWebhookChange`, `WhatsappWebhookValue`, `WhatsappWebhookMessage`, `WhatsappWebhookContact`, `WhatsappWebhookMetadata`)**: Definem a estrutura completa do payload recebido do webhook do WhatsApp.
* **`MetaApiResponse`**: Define a estrutura da resposta esperada da Meta API ao enviar uma mensagem.
* **`MetaApiErrorResponseData`**: Define a estrutura de dados de erro da Meta API.

---

### 3. `ChatModule` (`src/chat/`)

Responsável pela lógica do chat, gerenciamento de conversas e comunicação via WebSocket.

#### 3.1. `ChatGateway` (`chat.gateway.ts`)

Gateway WebSocket para comunicação em tempo real com os clientes (frontend).

* **Configuração (`@WebSocketGateway`)**:
    * `cors: { origin: '*', methods: ['GET', 'POST'] }`: Permite conexões de qualquer origem. 
    * `transports: ['websocket']`: Usa apenas o transporte WebSocket. 
* **`handleConnection(client: Socket)`**: Loga a conexão de um novo cliente.
* **`handleDisconnect(client: Socket)`**: Loga a desconexão de um cliente. 
* **`@SubscribeMessage('sendMessage') handleSendMessage(data, client)`**:
    * Ouve o evento `sendMessage` dos clientes.
    * Recebe `{ to: string, message: string }`.
    * Chama `chatService.handleOutgoingMessage()` para processar e enviar a mensagem.
    * Emite `messageSendError` de volta ao cliente em caso de falha.
* **`@OnEvent('chat.incoming') handleIncomingChatMessage(message: ChatMessage)`**:
    * Ouve o evento interno `chat.incoming`.
    * Emite o evento `incomingMessage` via WebSocket para todos os clientes conectados com o `ChatMessage`.
* **`@OnEvent('chat.outgoing') handleOutgoingChatMessage(message: ChatMessage)`**:
    * Ouve o evento interno `chat.outgoing`.
    * Emite o evento `outgoingMessage` via WebSocket para todos os clientes conectados com o `ChatMessage`.
* **Dependências**: `ChatService`, `Server` (socket.io).

#### 3.2. `ChatService` (`chat.service.ts`)

Serviço contendo a lógica principal do chat.

* **`conversations: Map<string, ChatMessage[]>`**: Armazena o histórico de conversas em memória. A chave é o número de telefone. 
* **`saveMessage(phoneNumber: string, message: ChatMessage)`**: Salva uma mensagem no histórico da conversa.
* **`@OnEvent('whatsapp.incomingMessage') processIncomingWhatsappEvent(message: WhatsappWebhookMessage)`**:
    * Principal handler para mensagens recebidas do WhatsApp via evento.
    * Converte `WhatsappWebhookMessage` para `ChatMessage` (tipo `incoming`).
    * Salva a mensagem.
    * Emite `chat.incoming` para o `ChatGateway`.
    * Envia uma resposta automática via `MetaApiService`.
    * Salva a resposta (tipo `outgoing`) e emite `chat.outgoing`.
    * Lida com tipos de mensagem não suportados.
* **`handleOutgoingMessage(to: string, message: string)`**:
    * Chamado pelo `ChatGateway` quando um usuário envia uma mensagem pelo frontend.
    * Envia a mensagem para o destinatário via `MetaApiService`.
    * Cria um `ChatMessage` (tipo `outgoing`), salva e emite `chat.outgoing`.
* **`getChatHistory(phoneNumber: string)`**: Retorna o histórico de mensagens para um número de telefone.
* **Dependências**: `MetaApiService`, `EventEmitter2`.

#### 3.3. `ChatModule` (`chat.module.ts`)

Define o módulo de chat.

* **Imports**: `EventEmitterModule.forRoot()`, `forwardRef(() => MetaApiModule)` (para resolver dependência circular, já que `ChatService` usa `MetaApiService`).
* **Providers**: `ChatService`, `ChatGateway`.
* **Exports**: `ChatService`.

#### 3.4. Interfaces (`src/common/interfaces/`)

* **`ChatMessage`**: Define a estrutura padronizada para mensagens de chat dentro do sistema.
    * `id: string`
    * `from: string`
    * `to: string`
    * `timestamp: string`
    * `text?: string`
    * `type: 'incoming' | 'outgoing'`

---

### 4. `Common` (`src/common/`)

Módulos e arquivos utilitários comuns.

#### 4.1. `AllExceptionsFilter` (`http-exception.filter.ts`)

Filtro global de exceções.

* **`@Catch()`**: Captura todas as exceções não tratadas.
* **`catch(exception: unknown, host: ArgumentsHost)`**:
    * Obtém os objetos `request` e `response`. 
    * Determina o `status` HTTP e a `message` com base no tipo de exceção:
        * `AxiosError`: Erros de comunicação com APIs externas. 
        * `HttpException`: Erros HTTP lançados pela aplicação.
        * `Error`: Erros genéricos do JavaScript.
        * Outros/Desconhecidos.
    * Loga detalhadamente o erro.
    * Envia uma resposta JSON padronizada para o cliente, incluindo `details` em ambiente de não produção.
* **Dependências**: `Logger`.

#### 4.2. Interfaces (`src/common/interfaces/`)

Além das já mencionadas (`ChatMessage`, `MetaApiErrorResponseData`, `WhatsappWebhookPayload` e relacionadas):

* **`SendMessageSuccessResponse`**: Interface para uma resposta de sucesso genérica ao enviar mensagens.

---

## Configuração e Inicialização (`src/main.ts`)

Ponto de entrada da aplicação.

* Cria a instância da aplicação NestJS (`NestFactory.create<NestExpressApplication>(AppModule)`).
* **`app.useStaticAssets(join(process.cwd(), 'static'))`**: Configura o serviço de arquivos estáticos da pasta `static`.
* **`app.useWebSocketAdapter(new IoAdapter(app))`**: Habilita o adaptador WebSocket.
* **`app.useGlobalFilters(new AllExceptionsFilter())`**: Registra o filtro de exceções global.
* Inicia o servidor na porta configurada (`process.env.PORT ?? 3000`).
* Loga a URL em que a aplicação está rodando.

---

## Variáveis de Ambiente (Exemplo `.env`)

```dotenv
PORT=3000

# Meta API Configuration
META_API_URL=[https://graph.facebook.com/v19.0/](https://graph.facebook.com/v19.0/)
META_API_PHONE_NUMBER_ID=your_phone_number_id
META_API_ACCESS_TOKEN=your_access_token
META_WEBHOOK_VERIFY_TOKEN=your_strong_verify_token

```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# test coverage
$ pnpm run test:cov
```

