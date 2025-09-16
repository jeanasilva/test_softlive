# Digital Wallet API (Teste Softlive)

Serviço em NestJS para gerenciar usuários, carteiras e transações P2P utilizando SQLite. Inclui validação automática, documentação Swagger, autenticação JWT e atualização transacional de saldos.

## Requisitos

- Node.js 18+
- npm 10+

O banco de dados é criado automaticamente em `data/database.sqlite` na primeira execução.

## Instalação

```bash
npm install
```

## Execução

```bash
# desenvolvimento (watch)
npm run start:dev

# produção
npm run build
npm run start:prod
```

Servidor: http://localhost:3000

## Documentação (Swagger)

Swagger UI: http://localhost:3000/api-docs

- Clique em “Authorize” e informe o JWT para acessar rotas protegidas.

## Variáveis de Ambiente

- `DATABASE_FILE` (opcional): caminho do arquivo SQLite (padrão `data/database.sqlite`).
- `JWT_SECRET` (opcional): segredo HS256 (padrão `dev-secret-change-me`, altere em produção).
- `JWT_EXPIRES_IN` (opcional): expiração do token em segundos (padrão `86400`).

## Fluxo de Autenticação

1) Registro (público)
- `POST /auth/register`
  - corpo: `{ "name": "Alice", "email": "alice@example.com", "password": "s3cret!" }`
  - retorno: usuário sem senha

2) Login
- `POST /auth/login`
  - corpo: `{ "email": "alice@example.com", "password": "s3cret!" }`
  - retorno: `{ "accessToken": "<JWT>" }`

3) Autorização
- Envie o header: `Authorization: Bearer <token>`

Observação: `POST /users` também cria usuário (público), mas recomenda-se usar `/auth/register` para onboarding.

## Rotas

Auth
- `POST /auth/register` (público) — cria usuário
- `POST /auth/login` (público) — obtém JWT

Users
- `POST /users` (público) — cria usuário
- `GET /users` (JWT) — lista usuários com `?page=&limit=`
- `GET /users/:id` (JWT) — busca usuário por id

Wallets (JWT)
- `POST /wallets` — cria carteira `{ userId, currency }` (suportadas: `BRL`, `USD`, `EUR`)
- `GET /wallets/:id` — detalhes da carteira
- `GET /wallets/:id/balance` — saldo da carteira

Transactions (JWT)
- `POST /transactions` — cria transferência `{ fromWalletId, toWalletId, amount, transactionId? }`
- `GET /transactions` — lista, suporta `?page=&limit=`

## Regras de Domínio

- Users: e-mail único; senhas com hash (bcrypt)
- Wallets: saldo decimal com transformador para SQLite; pertence a um usuário
- Transactions: transferência atômica com QueryRunner; impede mesma carteira, valida saldo; status salvo como `simple-enum`

## Paginação

Listagens aceitam `page` (>=1) e `limit` (1..100). Ex.: `GET /users?page=1&limit=10`.

## Dicas de Desenvolvimento

- Usando `synchronize: true`. Se alterar entidades localmente, exclua `data/database.sqlite` para regenerar o schema.

## Testes

```bash
npm run test
```

## Lint / Formatação

```bash
npm run lint
npm run format
```

## Licença

MIT
