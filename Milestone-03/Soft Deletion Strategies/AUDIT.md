# LedgerApp Hard Deletion Audit Report

## 1. Executive Summary

This audit identifies all existing hard `DELETE` operations, cascading deletion constraints, and dynamically constructed removal operations across the LedgerApp codebase (`Milestone-03/Soft Deletion Strategies`).

In a financial management platform, permanent data destruction introduces extreme risk:
- **Ledger Invariance Violation**: Hard deleting transaction records breaks double-entry accounting integrity, reconciliation balances, and historical auditing.
- **Cascading Data Loss**: PostgreSQL schema constraints currently define `ON DELETE CASCADE` on child tables. Deleting a single user cascades into the irreversible destruction of all their accounts and historical financial transactions.
- **Regulatory Non-Compliance**: Financial regulations (e.g., SOX Section 802, FINRA Rule 4511, Bank Secrecy Act / AML, HMRC/IRS tax record laws) strictly require financial institutions and fintech applications to retain records for 5 to 7 years.

This document catalogs every hard deletion operation found in the codebase, evaluates its operational and business consequences, and defines which operations should transition to soft deletion versus those that legitimately warrant hard deletion.

---

## 2. Inventory of Discovered Hard Delete Operations

| # | File Path | Line(s) | Target Table | Route / Function | SQL Statement | Consequence & Severity |
|---|-----------|---------|--------------|------------------|---------------|------------------------|
| 1 | `routes/users.js` | 44 | `users` | `DELETE /users/:id` | `DELETE FROM users WHERE id = $1` | **CRITICAL**: Permanently destroys user identity records. Triggers database-level `ON DELETE CASCADE` on `accounts(user_id)` and recursively cascades to `transactions(account_id)`, obliterating all associated financial accounts and transaction histories. |
| 2 | `routes/accounts.js` | 43 | `accounts` | `DELETE /accounts/:id` | `DELETE FROM accounts WHERE id = $1` | **CRITICAL**: Permanently deletes bank accounts. Triggers `ON DELETE CASCADE` on `transactions(account_id)`, instantly erasing all debits and credits linked to the account. Prevents balance reconstruction and financial reconciliation. |
| 3 | `routes/transactions.js` | 43 | `transactions` | `DELETE /transactions/:id` | `DELETE FROM transactions WHERE id = $1` | **CRITICAL**: Erases immutable transaction records. Financial ledgers must never permit row deletion; destroying debit/credit records creates balance discrepancies, hides potential fraud or embezzlement, and destroys forensic audit trails. |
| 4 | `schema.sql` | 17 | `accounts` | DDL Constraint | `user_id INTEGER REFERENCES users(id) ON DELETE CASCADE` | **HIGH**: Schema-level cascading deletion rule that forces PostgreSQL to purge related accounts whenever a user record is removed. |
| 5 | `schema.sql` | 26 | `transactions` | DDL Constraint | `account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE` | **HIGH**: Schema-level cascading deletion rule that forces PostgreSQL to purge related transactions whenever an account record is removed. |

---

## 3. Detailed Operation Analysis

### 3.1. User Hard Delete (`routes/users.js:44`)
- **Route Handler**: `router.delete('/:id', ...)`
- **SQL Executed**: `DELETE FROM users WHERE id = $1`
- **Current Behavior**: If a user exists, it is permanently deleted from the `users` table. The handler responds with `{ message: 'User permanently deleted from LedgerApp' }`.
- **System Consequence**: Due to foreign key cascading (`ON DELETE CASCADE`), all accounts belonging to the user and all transactions belonging to those accounts are immediately erased from the database in the same transaction.
- **Classification**: **Must Transition to Soft Delete**. Users must have a `deleted_at` timestamp. Historical associations with accounts and transactions must remain intact for auditability.

### 3.2. Account Hard Delete (`routes/accounts.js:43`)
- **Route Handler**: `router.delete('/:id', ...)`
- **SQL Executed**: `DELETE FROM accounts WHERE id = $1`
- **Current Behavior**: Permanently removes the account from the `accounts` table. Responds with `{ message: 'Account permanently deleted from LedgerApp' }`.
- **System Consequence**: All transactions referencing this account (`account_id`) are permanently wiped out via cascade delete.
- **Classification**: **Must Transition to Soft Delete**. Closing or deactivating a bank account is a standard business workflow (`deleted_at = NOW()`), but its historical statements and audit trail must be preserved.

### 3.3. Transaction Hard Delete (`routes/transactions.js:43`)
- **Route Handler**: `router.delete('/:id', ...)`
- **SQL Executed**: `DELETE FROM transactions WHERE id = $1`
- **Current Behavior**: Deletes a specific transaction record permanently. Responds with `{ message: 'Transaction record permanently erased from LedgerApp' }`.
- **System Consequence**: An immutable financial event is wiped from existence. Account balances can no longer be mathematically reconciled against the sum of historical transactions.
- **Classification**: **Must Transition to Soft Delete**. In standard financial systems, transactions should rarely even be soft-deleted (reversal entries are preferred), but when soft deletion is requested via API, setting `deleted_at = NOW()` ensures the record remains queryable for compliance, dispute management, and audit inspection.

---

## 4. Architectural Boundaries: What Must Transition vs. What Should Remain Hard Delete

### 4.1. Entities Transitioning to Soft Deletion
1. **`users` Table**:
   - Holds customer master data, identity, and compliance profiles.
   - Soft deletion preserves identity links for historical auditing, anti-money laundering (AML) tracking, and KYC recordkeeping.
2. **`accounts` Table**:
   - Represents financial depository accounts (checking, savings).
   - Soft deletion allows accounts to be closed or deactivated without breaking historical references from past statements.
3. **`transactions` Table**:
   - Represents credit and debit ledger records.
   - Soft deletion ensures financial events remain verifiable for external auditors, tax authorities, and internal reconciliation.

### 4.2. Operations and Data That Should Remain Hard Deletes
Not all data in a software platform belongs in a soft-deletion pattern. The following categories **must remain hard deletes**:

1. **Authentication Sessions & Refresh Tokens**:
   - *Technical / Security Reason*: Session identifiers, JWT refresh tokens, and active token blacklists must be permanently wiped upon user logout or session invalidation. Storing expired/revoked session tokens indefinitely increases token leakage risk and unnecessary table bloat without regulatory value.
2. **Ephemeral Caches & Deduplication Keys**:
   - *Technical Reason*: Temporary rate-limiting buckets, distributed idempotency keys (e.g., Redis or PG uncommitted locks), and transient API caching tables serve only short-lived operational needs. Soft-deleting them would cause runaway storage growth and index degradation.
3. **Password Reset Tokens & MFA Verification Codes**:
   - *Security Reason*: Single-use security nonces, OTPs, and password reset tokens should be permanently expunged immediately after consumption or expiration to prevent replay attacks and minimize attack surfaces.
4. **Scheduled Retention / Legal Purge Policies (GDPR / Right to be Forgotten)**:
   - *Regulatory / Technical Reason*: When data retention periods expire (e.g. after the legally mandated 7-year statutory financial retention window) or when non-financial personal data is requested to be removed under GDPR Article 17, explicit batch-purge background jobs should execute hard deletes or cryptographic erasure.

---

## 5. Migration and Implementation Strategy

1. **Schema Enhancements**:
   - Add `deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL` to `users`, `accounts`, and `transactions`.
   - Add partial indexes for active records to preserve query performance:
     ```sql
     CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;
     CREATE INDEX idx_accounts_active ON accounts(id) WHERE deleted_at IS NULL;
     CREATE INDEX idx_transactions_active ON transactions(id) WHERE deleted_at IS NULL;
     ```
2. **Application Query Updates**:
   - Update `DELETE` routes to execute `UPDATE ... SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *`.
   - Update standard read queries (`SELECT`) to include `WHERE deleted_at IS NULL` (handling single reads, list reads, and foreign key lookups).
   - Avoid cascade deletion bugs: Deleting a user soft-deletes the user. When listing accounts or transactions, ensure queries accurately respect deletion boundaries.
3. **Audit / Administrative Read Capabilities**:
   - Introduce dedicated administrative endpoints / query parameters (e.g., `/audit/deleted` or `include_deleted=true` / authorized endpoints) enabling authorized auditors and compliance officers to inspect soft-deleted records (`WHERE deleted_at IS NOT NULL`).
