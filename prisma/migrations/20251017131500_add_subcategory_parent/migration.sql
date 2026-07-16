-- Hierarchical subcategories
ALTER TABLE "Subcategory" ADD COLUMN "parentId" UUID;
CREATE INDEX IF NOT EXISTS "Subcategory_parentId_idx" ON "Subcategory"("parentId");
-- Replace unique (categoryId, name) with (categoryId, parentId, name)
DROP INDEX IF EXISTS "Subcategory_categoryId_name_key";
CREATE UNIQUE INDEX "Subcategory_categoryId_parentId_name_key" ON "Subcategory"("categoryId", "parentId", "name");

ALTER TABLE "Subcategory"
  ADD CONSTRAINT "Subcategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Subcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;


