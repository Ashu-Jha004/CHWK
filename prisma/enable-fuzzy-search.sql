-- Enable PostgreSQL extensions for fuzzy search
-- Run these commands in your database

-- Enable pg_trgm for trigram similarity matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable fuzzystrmatch for additional fuzzy matching functions
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

-- Verify extensions are enabled
SELECT extname FROM pg_extension WHERE extname IN ('pg_trgm', 'fuzzystrmatch');
