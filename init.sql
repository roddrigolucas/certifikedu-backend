-- Local auth credentials table (replaces AWS Cognito)
CREATE TABLE IF NOT EXISTS auth_credentials (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(10) NOT NULL DEFAULT 'PF',
  status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Local certificate ledger table (replaces AWS QLDB)
CREATE TABLE IF NOT EXISTS certificate_ledger (
  id SERIAL PRIMARY KEY,
  document_id VARCHAR(255) UNIQUE NOT NULL,
  certificate_data JSONB NOT NULL,
  document_hash VARCHAR(64) NOT NULL,
  previous_hash VARCHAR(64) NOT NULL DEFAULT '0',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_auth_credentials_email ON auth_credentials(email);
CREATE INDEX IF NOT EXISTS idx_certificate_ledger_document_id ON certificate_ledger(document_id);
CREATE INDEX IF NOT EXISTS idx_certificate_ledger_hash ON certificate_ledger(document_hash);
