# Soft Deletion Strategies: Architectural Trade-Offs & Analysis

This document details the architectural decisions, trade-offs, performance implications, and compliance rationale for introducing soft deletion into LedgerApp (`Milestone-03/Soft Deletion Strategies`).

---

## 1. LedgerApp-Specific Scenarios for Soft Deletion

### Scenario A: Account Closure & Historical Statement Invariance
In a retail or business banking platform, customers regularly close bank accounts (due to churning, switching institutions, or closing specialized sub-accounts). 
- **The Failure of Hard Deletion**: When an account is closed via `DELETE /accounts/:id`, hard deletion triggers `ON DELETE CASCADE` across foreign keys, obliterating all historical debit and credit transactions (`transactions` table). Months or years later, the customer, tax authorities (e.g., IRS/HMRC), or legal representatives may request historical statements for tax filings, corporate audits, or mortgage verification. If records were permanently removed, historical reconstruction is mathematically impossible.
- **The Soft Deletion Solution**: Soft-deleting accounts (`UPDATE accounts SET deleted_at = NOW() WHERE id = $1`) and their associated entities hides the closed account from ordinary day-to-day banking workflows (`WHERE deleted_at IS NULL`), while ensuring that the full financial ledger, account balances at closure, and transaction trails remain permanently intact for authorized historical statement generation.

### Scenario B: Disputed Transactions & Forensic Audit Trails
Financial applications frequently encounter disputes, duplicate transaction charges, chargebacks, or suspected fraud.
- **The Failure of Hard Deletion**: If a customer support agent or merchant integration calls `DELETE /transactions/:id` to remove a disputed or accidental transaction, a hard delete erases the event. This causes an irreversible discontinuity in the account's audit sequence, destroys the foreign counterparty description, and erases forensic evidence needed during legal discovery or fraud ring investigations.
- **The Soft Deletion Solution**: By setting `deleted_at = NOW()`, the disputed transaction is immediately excluded from active balance aggregates and transaction feeds, but remains queryable by compliance officers and fraud detection systems to establish pattern analysis, employee embezzlement tracking, and regulatory transparency.

---

## 2. Architectural Boundaries: What Must Soft-Delete vs. What Should Remain Hard-Deleted

In LedgerApp, the domain entities are strictly financial: `users`, `accounts`, and `transactions`. Because every one of these entities carries legal, financial, and regulatory compliance obligations, **all three core tables must implement soft deletion**.

However, in an expanded production system, auxiliary temporary data must remain eligible for **hard deletion**. Artificial tables must not be bolted onto core financial ledgers merely to demonstrate deletion; rather, the distinction is architectural:

| Data Category | Technical Reason for Hard Deletion | Security / Regulatory Reason | Target Strategy |
|---|---|---|---|
| **User Sessions & Auth Tokens** | Retaining expired tokens generates massive table bloat and slows down auth queries. Millions of daily logins would saturate memory and indexes. | **Security hygiene**: Storing invalid/expired session tokens indefinitely expands the attack surface for credential stuffing, token replay, and token leakage in database dumps. | **Hard Delete (`DELETE FROM sessions WHERE token = $1`)** upon logout or expiration. |
| **Idempotency Keys & Request Deduplication Locks** | Short-lived deduplication keys prevent duplicate charge requests within a brief window (e.g., 5–15 minutes). After expiry, they serve zero business value. | Table growth would quickly degrade write latency on high-throughput payment processing APIs. | **Hard Delete / TTL Expiry**. |
| **One-Time Passwords (OTPs) & Password Reset Nonces** | Ephemeral secrets with a typical TTL of 5–10 minutes. | **Defense-in-depth**: Prevent brute-force attempts and eliminate stale secrets from database persistence. | **Immediate Hard Delete** upon verification or expiration. |
| **GDPR Non-Financial PII Purge** | Retaining non-financial personal data beyond lawful processing limits violates data minimization principles. | **GDPR Article 17 ("Right to Erasure")**: Where not exempted by statutory financial retention laws (e.g. marketing preferences, temporary device tracking), data must be physically or cryptographically purged. | **Hard Delete / Anonymization Batch Purge**. |

---

## 3. Compliance & Audit Scenario

### 3.1. Regulatory Context (SOX Section 802 / FINRA / BSA / AML)
Financial regulations strictly dictate that transaction records and account histories must be retained for **5 to 7 years**. Under the Sarbanes-Oxley Act (SOX) Section 802, willful destruction or alteration of financial audit records carries severe criminal penalties.

### 3.2. Forensic Audit Query Examples

#### Audit Query 1: Retrieve All Voided/Deleted Transactions in a Fiscal Period
An auditor investigating discrepancies between reported revenue and transaction logs executes the following query to inspect all soft-deleted transactions during the fiscal year:

```sql
SELECT 
    t.id AS transaction_id,
    t.account_id,
    u.id AS user_id,
    u.email AS user_email,
    t.amount,
    t.type,
    t.description,
    t.created_at AS transaction_time,
    t.deleted_at AS deletion_time,
    ROUND(EXTRACT(EPOCH FROM (t.deleted_at - t.created_at)) / 3600.0, 2) AS hours_active_prior_to_deletion
FROM transactions t
JOIN accounts a ON t.account_id = a.id
JOIN users u ON a.user_id = u.id
WHERE t.deleted_at IS NOT NULL
  AND t.deleted_at >= '2026-01-01 00:00:00+00'
  AND t.deleted_at <  '2027-01-01 00:00:00+00'
ORDER BY t.deleted_at DESC;
```

#### Audit Query 2: Reconstruct Account Balance and Void Discrepancy
To verify whether voided transactions account for an unexplained balance mismatch on a closed account:

```sql
SELECT 
    a.id AS account_id,
    a.balance AS current_stored_balance,
    -- Sum of currently active transactions
    COALESCE(SUM(CASE 
        WHEN t.deleted_at IS NULL AND t.type = 'credit' THEN t.amount 
        WHEN t.deleted_at IS NULL AND t.type = 'debit'  THEN -t.amount 
        ELSE 0 
    END), 0) AS active_calculated_balance,
    -- Sum of voided/soft-deleted transactions
    COALESCE(SUM(CASE 
        WHEN t.deleted_at IS NOT NULL AND t.type = 'credit' THEN t.amount 
        WHEN t.deleted_at IS NOT NULL AND t.type = 'debit'  THEN -t.amount 
        ELSE 0 
    END), 0) AS voided_transaction_total
FROM accounts a
LEFT JOIN transactions t ON a.id = t.account_id
WHERE a.id = 101
GROUP BY a.id, a.balance;
```

---

## 4. Quantitative Performance & Storage Analysis

### 4.1. Physical Schema Characteristics & Row Sizing (PostgreSQL)

Based on the actual LedgerApp schema types:

| Table | Column Breakdown & Data Types | Estimated Row Width |
|---|---|---|
| `users` | `id` (INT4, 4B) + `name` (VARCHAR ~30B) + `email` (VARCHAR ~35B) + `created_at` (TIMESTAMPTZ, 8B) + `deleted_at` (TIMESTAMPTZ, 8B) + Tuple Header (23B) + Null Bitmap (1B) + Padding (3B) | **~112 bytes / row** |
| `accounts` | `id` (INT4, 4B) + `user_id` (INT4, 4B) + `account_type` (VARCHAR ~10B) + `balance` (NUMERIC(15,2), ~10B) + `created_at` (8B) + `deleted_at` (8B) + Tuple Header (23B) + Null Bitmap (1B) + Padding (4B) | **~72 bytes / row** |
| `transactions` | `id` (INT4, 4B) + `account_id` (INT4, 4B) + `amount` (NUMERIC(15,2), ~10B) + `type` (VARCHAR ~6B) + `description` (TEXT ~35B) + `created_at` (8B) + `deleted_at` (8B) + Tuple Header (23B) + Null Bitmap (1B) + Padding (1B) | **~100 bytes / row** |

*Note: In PostgreSQL, adding a nullable column (`deleted_at TIMESTAMPTZ DEFAULT NULL`) utilizes an existing null bitmap bit. When `deleted_at IS NULL`, the column consumes 0 data bytes on disk, costing storage only when set to an active timestamp (8 bytes).*

### 4.2. Storage Model: 1,000,000 Transactions (Assumption: 10% Soft-Deleted)

Let us evaluate a ledger database with **1,000,000 total historical transactions** where **100,000 (10%)** have been soft-deleted:

- **Raw Table Storage**:
  - 1,000,000 rows × ~100 bytes = **~100 MB** raw tuple data.
  - Adding page fill factor (~85%) and standard 8 KB page layout overhead: **~118 MB** total table disk size.
  - Storage cost of retaining the 100,000 deleted rows instead of hard deleting: **~11.8 MB** (less than 12 MB of disk storage). In modern cloud environments (e.g. AWS EBS or GCP Persistent Disk at ~$0.10/GB/month), retaining these 100,000 records costs less than **$0.0012 per month**, providing an overwhelmingly positive cost-to-compliance benefit.

### 4.3. Index Sizing & Read Throughput Comparison

| Metric | Full B-Tree Index (`ON transactions(id)`) | Partial B-Tree Index (`ON transactions(id) WHERE deleted_at IS NULL`) | Difference & Benefit |
|---|---|---|---|
| **Indexed Tuples** | 1,000,000 entries | 900,000 entries | **10% fewer index entries** |
| **B-Tree Leaf Pages** | ~3,356 pages (8 KB each) | ~3,020 pages (8 KB each) | **336 fewer pages in RAM** |
| **RAM Footprint in `shared_buffers`** | ~26.8 MB | ~24.1 MB | **Saves ~2.7 MB RAM** |
| **Index Traversal Depth** | Typically 3 B-Tree levels | Stays 2–3 levels longer | Eliminates dead tuple traversal |
| **Cache Hit Probability** | Lower (contains cold deleted records) | **Higher** (only active records indexed) | Higher cache residency for operational reads |

---

## 5. Partial Indexes: Purpose, Mechanics & Trade-Offs

### 5.1. Purpose
The assignment requires the specific partial index pattern:
```sql
CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_active ON accounts(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_active ON transactions(id) WHERE deleted_at IS NULL;
```
The purpose of a partial index with the predicate `WHERE deleted_at IS NULL` is to create an index structure that contains **only the rows currently considered active by the application**.

### 5.2. Core Advantages
1. **Compact Index Size**: As soft-deleted records accumulate over months and years, standard indexes grow unbounded. Partial indexes filter out all records where `deleted_at IS NOT NULL`, keeping index volume strictly proportional to active operational data.
2. **Reduced Buffer Pool Churn**: Because inactive records are never placed into the partial index, database memory (`shared_buffers`) is not wasted caching index leaves for records that ordinary users will never query.
3. **No Index Maintenance for Deleted Updates**: Once a record is marked `deleted_at = NOW()`, it is pruned from the partial index. Any future background updates, table vacuums, or batch archival tasks on that record do not need to update `idx_tablename_active`.

### 5.3. Key Trade-Offs & Mitigations
1. **Query Planner Predicate Requirement**:
   - *Trade-off*: PostgreSQL's query optimizer will **only** select a partial index if the query's `WHERE` clause mathematically implies the index predicate. A query like `SELECT * FROM users WHERE id = 1` will not use `idx_users_active` unless rewritten as `SELECT * FROM users WHERE id = 1 AND deleted_at IS NULL`.
   - *Mitigation*: All LedgerApp route queries (`GET /`, `GET /:id`, `GET /user/:userId`, `GET /account/:accountId`) have been explicitly updated to include `WHERE deleted_at IS NULL`.
2. **Audit Query Incompatibility**:
   - *Trade-off*: Admin and audit queries filtering `WHERE deleted_at IS NOT NULL` cannot use `idx_tablename_active`.
   - *Mitigation*: In an operational banking system, audit queries are executed infrequently by back-office systems or compliance staff. If audit query volume increases at scale, a complementary partial index `WHERE deleted_at IS NOT NULL` can be added without bloating the active read path.
3. **Unique Constraint Complexity**:
   - *Trade-off*: A standard `UNIQUE` constraint across an entire column (e.g. `users.email`) prevents a churned user from ever re-registering with their old email address if their previous record is soft-deleted.
   - *Mitigation*: In production systems, this is solved by replacing full-table uniqueness with a partial unique index:
     `CREATE UNIQUE INDEX idx_users_email_active ON users(email) WHERE deleted_at IS NULL;`
