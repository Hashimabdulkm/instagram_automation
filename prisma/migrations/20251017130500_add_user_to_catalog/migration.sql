-- Add userId columns
ALTER TABLE "Category" ADD COLUMN "userId" UUID NOT NULL;
ALTER TABLE "Subcategory" ADD COLUMN "userId" UUID NOT NULL;
ALTER TABLE "Product" ADD COLUMN "userId" UUID NOT NULL;

-- Unique compound for per-user category names
CREATE UNIQUE INDEX IF NOT EXISTS "Category_userId_name_key" ON "Category"("userId", "name");

-- Indexes
CREATE INDEX IF NOT EXISTS "Subcategory_userId_idx" ON "Subcategory"("userId");
CREATE INDEX IF NOT EXISTS "Product_userId_idx" ON "Product"("userId");

-- Foreign keys
ALTER TABLE "Category"
  ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Subcategory"
  ADD CONSTRAINT "Subcategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Product"
  ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


