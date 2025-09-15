-- Enable PostgreSQL extensions for advanced search
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_business_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW."searchVector" := to_tsvector('english', 
    unaccent(coalesce(NEW.name, '')) || ' ' ||
    unaccent(coalesce(NEW.bio, '')) || ' ' ||
    unaccent(coalesce(NEW.category, '')) || ' ' ||
    unaccent(coalesce(NEW.suburb, ''))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
DROP TRIGGER IF EXISTS update_business_search_vector_trigger ON "businesses";
CREATE TRIGGER update_business_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "businesses"
  FOR EACH ROW
  EXECUTE FUNCTION update_business_search_vector();

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS "businesses_search_vector_idx" ON "businesses" USING GIN("searchVector");

-- Create GIN index for trigram similarity on name
CREATE INDEX IF NOT EXISTS "businesses_name_trgm_idx" ON "businesses" USING GIN(name gin_trgm_ops);

-- Create GIN index for trigram similarity on suburb
CREATE INDEX IF NOT EXISTS "businesses_suburb_trgm_idx" ON "businesses" USING GIN(suburb gin_trgm_ops);

-- Create GIN index for trigram similarity on category
CREATE INDEX IF NOT EXISTS "businesses_category_trgm_idx" ON "businesses" USING GIN(category gin_trgm_ops);

-- Update existing records to populate search vector
UPDATE "businesses" SET "searchVector" = to_tsvector('english', 
  unaccent(coalesce(name, '')) || ' ' ||
  unaccent(coalesce(bio, '')) || ' ' ||
  unaccent(coalesce(category, '')) || ' ' ||
  unaccent(coalesce(suburb, ''))
) WHERE "searchVector" IS NULL;