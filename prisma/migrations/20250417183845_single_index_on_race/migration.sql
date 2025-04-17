-- DropIndex
DROP INDEX "Race_id_slug_idx";

-- CreateIndex
CREATE INDEX "Race_slug_idx" ON "Race"("slug");
