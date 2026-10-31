# LedgerApp - Financial Record Management API

Welcome to LedgerApp! This is a core financial API designed to manage user identities, financial accounts, and transaction history with enterprise-grade auditability, partial active indexing, relational soft deletion cascades, and forensic query capabilities.

---

## 🌐 Live Deployment
- **Deployment Status**: `[PENDING DEPLOYMENT — Awaiting Render / Railway Account Authorization]`
- **Deployment Configuration**: A complete cloud blueprint is included in [`render.yaml`](./render.yaml). When deploying to Render or Railway, link this repository and the service will provision PostgreSQL (`ledgerapp`), attach the connection string to `DB_URL`, configure a secure `ADMIN_API_KEY`, and boot the application automatically.

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
   *(Or apply [`migration.sql`](./migration.sql) if migrating an existing database instance without dropping data).*

4. Configure environment variables:
   - Create a `.env` file based on `.env.example`.
   - Set `DB_URL` with your database credentials.
   - Set `ADMIN_API_KEY` with a strong secret required for authorized audit inspection endpoints (missing configuration fails closed).

5. Start the application:
   ```bash
   npm start
   ```

---

## 🧪 Testing & Verification

The project includes an in-memory integration test suite ([`test.js`](./test.js)) utilizing `pg-mem` emulation and `supertest` HTTP assertions for deterministic, hermetic local and CI verification without requiring an external PostgreSQL daemon.

Run the test suite:
```bash
node test.js
```
*(or `npm test`)*

The test suite validates:
- Schema initialization and partial active index definitions (`idx_users_active`, `idx_accounts_active`, `idx_transactions_active`).
- Soft deletion on Users (`DELETE /users/:id` sets `deleted_at = NOW()` and keeps the row intact).
- Normal query exclusion (`GET /users` and `GET /users/:id` filter `WHERE deleted_at IS NULL`).
- Relational cascading soft-deletes (soft-deleting a user also cascades soft deletion to their accounts and transactions).
- Relationship integrity guards (preventing creation of accounts or transactions under soft-deleted parents).
- Repeated soft deletion edge cases (returns 404 for already deleted or missing records).
- Strict Admin Authorization:
  - Missing server `ADMIN_API_KEY` configuration fails closed (HTTP 500).
  - Unauthenticated clients (no secret) receive HTTP 401 Unauthorized.
  - Clients attempting unverified role headers (e.g. `x-admin-role: admin`) without a secret receive HTTP 401.
  - Invalid secrets receive HTTP 403 Forbidden.
  - Authorized admin requests (`x-admin-key: <ADMIN_API_KEY>` or `Authorization: Bearer <ADMIN_API_KEY>`) successfully inspect soft-deleted records (`WHERE deleted_at IS NOT NULL`).

---

## 🛠 API Endpoints

### 👤 Users
- `GET /users`: List all active users (`WHERE deleted_at IS NULL`).
- `GET /users/:id`: Get active user details by ID.
- `POST /users`: Create a new user (`deleted_at = NULL`).
- `DELETE /users/:id`: **Soft-delete** user (sets `deleted_at = NOW()` and cascades soft-delete to child accounts and transactions).

### 💳 Accounts
- `GET /accounts`: List all active bank accounts (`WHERE deleted_at IS NULL` and user active).
- `GET /accounts/user/:userId`: List active accounts for an active user.
- `POST /accounts`: Create a new checking/savings account (validates active user).
- `DELETE /accounts/:id`: **Soft-delete** account (sets `deleted_at = NOW()` and cascades soft-delete to child transactions).

### 💸 Transactions
- `GET /transactions`: List all active transactions (`WHERE deleted_at IS NULL` and account/user active).
- `GET /transactions/account/:accountId`: List active transactions for an active account.
- `POST /transactions`: Post a new transaction (validates active account).
- `DELETE /transactions/:id`: **Soft-delete** transaction (sets `deleted_at = NOW()`).

### 🛡 Audit & Admin (Authorized Compliance Access Only)
*Requires header: `x-admin-key: <ADMIN_API_KEY>` OR `Authorization: Bearer <ADMIN_API_KEY>`.*
- `GET /audit/summary`: Summary count of active vs soft-deleted records across all tables.
- `GET /audit/users`: List all soft-deleted users (`WHERE deleted_at IS NOT NULL`).
- `GET /audit/accounts`: List all soft-deleted accounts (`WHERE deleted_at IS NOT NULL`).
- `GET /audit/transactions`: List all soft-deleted transactions (`WHERE deleted_at IS NOT NULL`).
- `GET /audit/all`: Complete audit view of all soft-deleted entities for regulatory compliance reviews.

---

## 🏗 Architecture & Documentation Reference

### 1. Mandatory Audit Report
- See [`AUDIT.md`](./AUDIT.md) for the initial hard-delete discovery audit. Documents every discovered hard delete operation, foreign key cascading constraints (`ON DELETE CASCADE`), and why all three financial entities (`users`, `accounts`, `transactions`) were transitioned to soft deletion.

### 2. Architectural Trade-Off Analysis
- See [`TRADEOFFS.md`](./TRADEOFFS.md) for comprehensive analysis:
  - **LedgerApp Scenarios**: Account churn historical statement invariance and disputed transaction forensic investigation.
  - **Hard-Deletion Boundaries**: Analysis of auxiliary ephemeral data (sessions, tokens, cache locks, and GDPR non-financial PII) that should remain hard-deleted.
  - **Regulatory Compliance**: SOX Section 802, FINRA Rule 4511, and BSA statutory retention queries with balance reconciliation examples.
  - **Quantitative Storage & Performance**: Physical row sizing (PostgreSQL tuple headers, null bitmaps, alignment) and 1,000,000-row volume model comparing full vs. partial B-Tree index traversal.
  - **Partial Indexes**:
    ```sql
    CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;
    CREATE INDEX idx_accounts_active ON accounts(id) WHERE deleted_at IS NULL;
    CREATE INDEX idx_transactions_active ON transactions(id) WHERE deleted_at IS NULL;
    ```
    Explains memory footprint reduction in `shared_buffers` and planner requirements (`WHERE deleted_at IS NULL`).

---

## 💡 Tech Stack
- **Node.js + Express**
- **PostgreSQL** with raw SQL execution via `pg` (node-postgres)
- **Partial B-Tree Indexes** for active record query acceleration
- **Testing**: In-memory PostgreSQL emulation via `pg-mem` and HTTP assertions via `supertest`
