-- Repeatable migration script to apply soft deletion to an existing LedgerApp database

-- 1. Add deleted_at column to primary tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. Create partial indexes for active records to optimize read performance
CREATE INDEX IF NOT EXISTS idx_users_active ON users(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_accounts_active ON accounts(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_active ON transactions(id) WHERE deleted_at IS NULL;
