# Digital Wallet API

NestJS service that manages users, wallets and peer to peer transactions backed by SQLite. The project ships with automatic validation, Swagger documentation and transactional balance updates.

## Requirements

- Node.js 18+
- npm 10+

The application stores data in `data/database.sqlite`. The file is created automatically on the first run.

## Setup

```bash
npm install
```

## Running

```bash
# development with live reload
npm run start:dev

# production build
npm run build
npm run start:prod
```

Once the app is running the HTTP server listens on http://localhost:3000.

## API Documentation

Interactive documentation is generated through Swagger and is available at http://localhost:3000/api-docs.

Authentication:
- Register: `POST /auth/register` with name, email, password (public)
- Login: `POST /auth/login` with email/password to obtain a JWT
Send the token as `Authorization: Bearer <token>` for protected endpoints (wallets, transactions, list/get users).

## Functional Areas

- **Users**: register new users and list existing ones (JWT-protected). Email uniqueness is enforced and passwords are stored as bcrypt hashes.
- **Wallets**: create wallets in supported currencies (BRL, USD, EUR), fetch wallet details and retrieve balances.
- **Transactions**: create transfers between wallets using ACID transactions and list historical operations.

All list endpoints support pagination via `page` and `limit` query params.

## Testing

```bash
npm run test
```

Use `npm run lint` and `npm run format` to keep the codebase consistent.

## License

This project is provided under the MIT license.

Environment variables:
- `DATABASE_FILE` (optional): path to SQLite file (default `data/database.sqlite`).
- `JWT_SECRET` (optional): secret key for JWT HS256 (default `dev-secret-change-me`, change in production).
- `JWT_EXPIRES_IN` (optional): token expiration in seconds (default `86400`).
