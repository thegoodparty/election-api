-- AlterTable
ALTER TABLE "ZipToPosition" ADD COLUMN     "pct_districtzip_to_zip" DOUBLE PRECISION,
ADD COLUMN     "voters_in_zip" BIGINT,
ADD COLUMN     "voters_in_zip_district" BIGINT;

-- CreateIndex
CREATE INDEX "ZipToPosition_zip_code_pct_districtzip_to_zip_idx" ON "ZipToPosition"("zip_code", "pct_districtzip_to_zip");
