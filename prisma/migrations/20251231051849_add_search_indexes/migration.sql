

-- Enable pg_trgm extension (already enabled, but adding for safety)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- GIN Indexes for Full-Text Search Performance
-- =====================================================

-- 1. Business Name Search (trigram for fuzzy matching)
CREATE INDEX IF NOT EXISTS idx_business_name_trgm
ON "businesses" USING gin (name gin_trgm_ops);

-- 2. Business Description Search
CREATE INDEX IF NOT EXISTS idx_business_description_trgm
ON "businesses" USING gin (description gin_trgm_ops);

-- 3. Business Metadata Keywords (exact + partial matching)
CREATE INDEX IF NOT EXISTS idx_business_metadata_keywords_gin
ON "businesses" USING gin ("metadataKeywords");

-- 4. Category Name Search
CREATE INDEX IF NOT EXISTS idx_category_name_trgm
ON "categories" USING gin (name gin_trgm_ops);

-- 5. Category Search Keywords (for intent mapping)
CREATE INDEX IF NOT EXISTS idx_category_search_keywords_gin
ON "categories" USING gin ("searchKeywords");

-- =====================================================
-- Geospatial Indexes for "Near Me" Performance
-- =====================================================

-- 6. Composite index for location-based queries
CREATE INDEX IF NOT EXISTS idx_business_location_active
ON "businesses" (latitude, longitude, status, "deletedAt")
WHERE status = 'ACTIVE' AND "deletedAt" IS NULL;

-- 7. City + Pincode for fallback searches
CREATE INDEX IF NOT EXISTS idx_business_city_pincode
ON "businesses" (city, pincode, status)
WHERE status = 'ACTIVE' AND "deletedAt" IS NULL;

-- =====================================================
-- Filter Indexes (Rating, Price, Verification)
-- =====================================================

-- 8. Rating + Review Count (for "best" sorting)
CREATE INDEX IF NOT EXISTS idx_business_rating_reviews
ON "businesses" ("averageRating" DESC, "totalReviews" DESC)
WHERE status = 'ACTIVE' AND "deletedAt" IS NULL;

-- 9. Price Range filter
CREATE INDEX IF NOT EXISTS idx_business_price_range
ON "businesses" ("priceRange", status)
WHERE "deletedAt" IS NULL;

-- 10. Verified businesses
CREATE INDEX IF NOT EXISTS idx_business_verified
ON "businesses" ("isVerified", status)
WHERE "deletedAt" IS NULL;

-- =====================================================
-- Composite Indexes for Complex Queries
-- =====================================================

-- 11. Location + Rating (most common search pattern)
CREATE INDEX IF NOT EXISTS idx_business_location_rating
ON "businesses" (city, "averageRating" DESC, status)
WHERE status = 'ACTIVE' AND "deletedAt" IS NULL;

-- 12. Category + Location (filtered searches)
CREATE INDEX IF NOT EXISTS idx_business_category_location
ON "business_categories" ("categoryId", "isPrimary");

-- =====================================================
-- Analytics Index (for SearchQuery model)
-- =====================================================

-- 13. Search analytics tracking
CREATE INDEX IF NOT EXISTS idx_search_query_term_location
ON "search_queries" (query, city, "createdAt" DESC);

-- 14. Failed searches (for optimization)
CREATE INDEX IF NOT EXISTS idx_search_query_no_results
ON "search_queries" ("hasResults", "createdAt" DESC)
WHERE "hasResults" = false;
