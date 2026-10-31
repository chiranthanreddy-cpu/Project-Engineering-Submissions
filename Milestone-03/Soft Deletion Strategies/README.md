# LedgerApp - Financial Record Management API

Welcome to LedgerApp! This is a core financial API designed to manage user identities, financial accounts, transaction ledgers, and temporary sessions with enterprise-grade auditability and soft deletion strategies.

---

## 🌐 Live Deployment
- **Deployment URL**: `[PENDING DEPLOYMENT]` *(Deployment will be initiated in a subsequent release step)*

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### Installation
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Create a PostgreSQL database called `ledgerapp`.

3. Initialize the database schema (includes soft deletion columns and partial indexes):
   ```bash
   psql -d ledgerapp -f schema.sql
   ```
   *(Or apply `migration.sql` if migrating an existing instance without dropping existing data).*

4. Configure environment variables:
   - Create a `.env` file based on `.env.example`.
   - Set `DB_URL` with your database credentials.
   - (Optional) Set `ADMIN_API_KEY` for authorized audit inspection endpoints (defaults to `ledgerapp-admin-secret-key`).

5. Start the application:
   ```bash
   npm start
   ```

---

## 🧪 Testing & Verification

The project includes an end-to-end integration test suite verifying all soft deletion flows, exclusion logic, partial indexes, relationship safety, temporary data hard deletes, and admin authorization.

Run the test suite:
```bash
node test.js
```
*(or `npm test`)*

The test suite validates:
- Schema initialization and partial index definitions (`idx_users_active`, `idx_accounts_active`, `idx_transactions_active`).
- Soft deletion on Users (`DELETE /users/:id` sets `deleted_at = NOW()` and keeps the row intact).
- Normal query exclusion (`GET /users` and `GET /users/:id` filter `WHERE deleted_at IS NULL`).
- Repeated soft deletion edge cases (returns 404 for already deleted or missing records).
- Cascading relationship guards (cannot create accounts or transactions under soft-deleted parents).
- Hard deletion verification for exempted temporary data (`DELETE /sessions/:token` permanently erases tokens).
- Admin / Audit endpoints (`GET /audit/*` rejects unauthorized requests with 403 Forbidden and returns soft-deleted records when authorized via `x-admin-role: admin`, `x-admin-key`, or `Authorization: Bearer <key>`).

---

## 🛠 API Endpoints

### 👤 Users
- `GET /users`: List all active users (`WHERE deleted_at IS NULL`).
- `GET /users/:id`: Get active user details by ID.
- `POST /users`: Create a new user (`deleted_at = NULL`).
- `DELETE /users/:id`: **Soft-delete** user (sets `deleted_at = NOW()`).

### 💳 Accounts
- `GET /accounts`: List all active bank accounts (`WHERE deleted_at IS NULL`).
- `GET /accounts/user/:userId`: List active accounts for an active user.
- `POST /accounts`: Create a new checking/savings account (validates active user).
- `DELETE /accounts/:id`: **Soft-delete** account (sets `deleted_at = NOW()`).

### 💸 Transactions
- `GET /transactions`: List all active transactions (`WHERE deleted_at IS NULL`).
- `GET /transactions/account/:accountId`: List active transactions for an active account.
- `POST /transactions`: Post a new transaction (validates active account).
- `DELETE /transactions/:id`: **Soft-delete** transaction (sets `deleted_at = NOW()`).

### 🔑 Sessions (Temporary Data - Hard Deletion)
- `GET /sessions`: List active session tokens.
- `GET /sessions/:token`: Get session details by token.
- `POST /sessions`: Create a new ephemeral session token.
- `DELETE /sessions/:token`: **Hard-delete** session token permanently from the database.

### 🛡 Audit & Admin (Authorized Access Only)
*Requires header: `x-admin-role: admin` OR `x-admin-key: ledgerapp-admin-secret-key` OR `Authorization: Bearer ledgerapp-admin-secret-key`.*
- `GET /audit/summary`: Summary count of active vs soft-deleted records across all tables.
- `GET /audit/users`: List all soft-deleted users (`WHERE deleted_at IS NOT NULL`).
- `GET /audit/accounts`: List all soft-deleted accounts (`WHERE deleted_at IS NOT NULL`).
- `GET /audit/transactions`: List all soft-deleted transactions (`WHERE deleted_at IS NOT NULL`).
- `GET /audit/all`: Complete audit view of all soft-deleted entities for compliance reviews.

---

## 🏗 Architecture & Soft Deletion Details

### 1. Schema Design
Every soft-deleted table includes `deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL`.
- `NULL` denotes an active, operational record.
- A valid timestamp denotes a soft-deleted record, preserving exact deletion time for forensic analysis.

### 2. Partial Indexes for Performance
To prevent table and index bloat as deleted records accumulate, partial indexes are applied according to the required pattern:
```sql
CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_active ON accounts(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_active ON transactions(id) WHERE deleted_at IS NULL;
```
These indexes restrict B-Tree size strictly to active records, saving cache memory in PostgreSQL's `shared_buffers` and accelerating operational reads.

### 3. Trade-Off Analysis & Regulatory Audit Report
- See [`AUDIT.md`](./AUDIT.md) for the initial hard-delete discovery audit.
- See [`TRADEOFFS.md`](./TRADEOFFS.md) for full compliance, SOX/AML regulations, storage math, and partial index trade-off analysis.

---

## 💡 Tech Stack
- **Node.js + Express**
- **PostgreSQL** with raw SQL execution via `pg` (node-postgres)
- **Partial B-Tree Indexes** for active record query acceleration
- **In-Memory Testing**: `pg-mem` and `supertest` for end-to-end automated verification
