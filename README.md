# Digital Wallet API (Softlive test)

NestJS service that manages users, wallets and peer-to-peer transactions backed by SQLite. Ships with validation, Swagger, JWT auth and transactional balance updates.

## Requirements

- Node.js 18+
- npm 10+

The application stores data in `data/database.sqlite` (auto-created on first run).

## Setup

```bash
npm install
```

## Running

```bash
# development (watch)
npm run start:dev

# production
npm run build
npm run start:prod
```

Server: http://localhost:3000

## API Docs (Swagger)

Swagger UI: http://localhost:3000/api-docs

- Use “Authorize” with a JWT for protected routes.

## Environment Variables

- `DATABASE_FILE` (optional): SQLite file path (default `data/database.sqlite`).
- `JWT_SECRET` (optional): HS256 secret (default `dev-secret-change-me`, change in production).
- `JWT_EXPIRES_IN` (optional): token expiration in seconds (default `86400`).

## Authentication Flow

1) Register (public)
- `POST /auth/register`
  - body: `{ "name": "Alice", "email": "alice@example.com", "password": "s3cret!" }`
  - returns: user without password

2) Login
- `POST /auth/login`
  - body: `{ "email": "alice@example.com", "password": "s3cret!" }`
  - returns: `{ "accessToken": "<JWT>" }`

3) Auth header
- `Authorization: Bearer <token>`

Note: `POST /users` also creates a user (public), but prefer `/auth/register` for onboarding.

## Routes

Auth
- `POST /auth/register` (public) — create user
- `POST /auth/login` (public) — obtain JWT

Users
- `POST /users` (public) — create user
- `GET /users` (JWT) — list users with `?page=&limit=`
- `GET /users/:id` (JWT) — get a user by id

Wallets (JWT)
- `POST /wallets` — create wallet `{ userId, currency }` (supported: `BRL`, `USD`, `EUR`)
- `GET /wallets/:id` — wallet details
- `GET /wallets/:id/balance` — wallet balance

Transactions (JWT)
- `POST /transactions` — create transfer `{ fromWalletId, toWalletId, amount, transactionId? }`
- `GET /transactions` — list, supports `?page=&limit=`

## Domain Rules

- Users: unique email; passwords hashed (bcrypt)
- Wallets: decimal balance with SQLite transformer; belongs to a user
- Transactions: atomic transfer with QueryRunner; refuses same-wallet, checks available funds; status saved as `simple-enum`

## Pagination

List endpoints accept `page` (>=1) and `limit` (1..100). Example: `GET /users?page=1&limit=10`.

## Development Tips

- Using `synchronize: true`. If entities change locally, delete `data/database.sqlite` to regenerate the schema.

## Testing

```bash
npm run test
```

## Lint / Format

```bash
npm run lint
npm run format
```

## License

MIT
