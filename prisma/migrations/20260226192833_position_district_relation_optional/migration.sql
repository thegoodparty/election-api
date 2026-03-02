-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_district_id_fkey";

-- AlterTable
ALTER TABLE "Position" ALTER COLUMN "district_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;
