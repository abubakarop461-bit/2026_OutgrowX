-- Migration 0001: Create electricity_bills and bill_extractions tables for Cloudflare D1
CREATE TABLE IF NOT EXISTS electricity_bills (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  original_filename TEXT,
  mime_type TEXT,
  status TEXT DEFAULT 'processed',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bill_extractions (
  id TEXT PRIMARY KEY,
  bill_id TEXT NOT NULL REFERENCES electricity_bills(id),
  consumer_name TEXT,
  consumer_number TEXT,
  discom TEXT,
  billing_period TEXT,
  bill_date TEXT,
  due_date TEXT,
  previous_reading REAL,
  current_reading REAL,
  units_consumed REAL,
  bill_amount REAL,
  tariff TEXT,
  raw_ocr_text TEXT,
  confidence REAL DEFAULT 0.95,
  extraction_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
